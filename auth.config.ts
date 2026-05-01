import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
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
