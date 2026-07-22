import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Route protection is declared in authConfig.callbacks.authorized.
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
