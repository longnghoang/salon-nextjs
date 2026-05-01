import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Allow access to login and next-auth api endpoints
      const isPublicRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/api/auth');

      if (!isLoggedIn) {
        // Redirect unauthenticated users to login page
        if (isPublicRoute) return true;
        return false; 
      } else if (nextUrl.pathname === '/login') {
        // Redirect logged-in users away from login to home
        return Response.redirect(new URL('/', nextUrl)); 
      }
      
      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
