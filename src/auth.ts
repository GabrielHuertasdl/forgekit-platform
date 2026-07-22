import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db/client'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: {
    /**
     * JWT strategy: sessions are validated via a signed cookie — no DB lookup
     * needed per request. This makes Edge middleware viable.
     * Trade-off: tokens cannot be invalidated immediately (they expire naturally).
     */
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      // Persist userId in the JWT so session() can read it without a DB call.
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
