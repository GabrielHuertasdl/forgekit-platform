import Link from 'next/link'
import { auth, signOut } from '@/platform/auth'
import { NavLinks, type NavLinkItem } from '@/ui/components/shared/nav-links'
import type { Route } from 'next'
import { getBalance } from '@/platform/credits'

const NAV_LINKS: NavLinkItem[] = [
  { href: '/dashboard' as Route, label: 'Dashboard' },
  { href: '/billing' as Route, label: 'Credits' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const balance = session?.user?.id ? await getBalance(session.user.id) : 0

  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? '?'
  const firstName = session?.user?.name?.split(' ')[0] ?? ''

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-lg tracking-tight">
              ForgeKit
            </Link>
            <NavLinks links={NAV_LINKS} />
          </div>

          <div className="flex items-center gap-3">
            {/* Credit balance chip */}
            {balance > 0 && (
              <Link
                href="/billing"
                className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {balance.toLocaleString()} credits
              </Link>
            )}

            {/* User menu */}
            {session?.user && (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {initial}
                  </div>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium truncate">{firstName}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      Credits & Billing
                    </Link>
                    <div className="border-t border-border my-1" />
                    <form action={handleSignOut}>
                      <button
                        type="submit"
                        className="w-full text-left px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
