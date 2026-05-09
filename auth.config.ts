import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const tenantName = process.env.AUTH_AZURE_AD_B2C_TENANT_NAME;
  const userFlow = process.env.AUTH_AZURE_AD_B2C_PRIMARY_USER_FLOW;
  const tokenUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${userFlow}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.AUTH_AZURE_AD_B2C_CLIENT_ID!,
    client_secret: process.env.AUTH_AZURE_AD_B2C_CLIENT_SECRET!,
    refresh_token: token.refreshToken!,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to refresh access token:', data);
    return { ...token, error: 'RefreshTokenError' };
  }

  return {
    ...token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? token.refreshToken,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
  };
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign-in: persist tokens and expiry
      if (user && account) {
        token.id = user.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires =
          Date.now() + (account.expires_in as number) * 1000;

        // Fetch user roles from the separated Web API using the email
        if (user.email) {
          try {
            const apiUrl = process.env.API_BASE_URL || '';
            const res = await fetch(`${apiUrl}/api/Users/${user.email}`, {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            });
            if (!res.ok) {
              console.error(
                'Failed to fetch user roles. Status:',
                res.status
              );
              throw new Error('Failed to fetch user profile');
            }

            const data = await res.json();
            // Map the roles array of objects to an array of string names
            const roles =
              data.roles?.map((role: { name: string }) => role.name) || [];
            token.roles = roles;
          } catch (error) {
            console.error('Error fetching user roles:', error);
            // Throwing an error here will cause the sign in to fail
            throw new Error('Access denied: Unable to verify user roles');
          }
        } else {
          // If there's no email, we cannot fetch the roles, prevent sign in
          throw new Error('Access denied: Email is required');
        }

        return token;
      }

      // Subsequent requests: return token if still valid
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60 * 1000
      ) {
        return token;
      }

      // Token expired: refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.user.roles = token.roles as string[];

        // Surface refresh errors to the client so it can force re-login
        if (token.error) {
          session.error = token.error;
        }
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Allow access to login and next-auth api endpoints
      const isPublicRoute =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/api/auth');

      if (!isLoggedIn) {
        // Redirect unauthenticated users to login page
        if (isPublicRoute) return true;
        return false;
      } else if (nextUrl.pathname === '/login') {
        // Redirect logged-in users away from login to previous page or home
        const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/';
        return Response.redirect(new URL(callbackUrl, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
