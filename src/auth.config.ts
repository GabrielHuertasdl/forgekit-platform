import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/billing']

/**
 * Edge-compatible auth config. No DB imports, no Node.js-only modules.
 * Used directly by middleware (Edge runtime) and spread into the full auth.ts.
 */
export const authConfig = {
  providers: [
    Google({
      // Read directly from process.env — env.ts validation is Node.js only.
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p))

      if (isProtected && !isLoggedIn) {
        const url = new URL('/sign-in', nextUrl.origin)
        url.searchParams.set('callbackUrl', nextUrl.pathname)
        return Response.redirect(url)
      }

      return true
    },
  },
} satisfies NextAuthConfig
