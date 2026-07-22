import { auth } from '@/platform/auth'
import { NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/billing']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const needsAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (needsAuth && !isLoggedIn) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  // Skip Next.js internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
