import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Google from 'next-auth/providers/google'
import { db } from '@/db/client'
import { env } from '@/lib/env'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
})
