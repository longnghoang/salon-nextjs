import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        if (account) {
          token.accessToken = account.access_token;
        }

        // Fetch user roles from the separated Web API using the email
        if (user.email) {
          try {
            const apiUrl = process.env.API_BASE_URL || '';
            const res = await fetch(`${apiUrl}/api/Users/${user.email}`, {
              headers: {
                Authorization: `Bearer ${account?.access_token}`,
              },
            });
            // console.log('res: ', res);
            if (!res.ok) {
              console.error('Failed to fetch user roles. Status:', res.status);
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
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.user.roles = token.roles as string[];
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
