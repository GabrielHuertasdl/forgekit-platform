import { redirect } from 'next/navigation'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { auth } from '@/platform/auth'
import { getBalance } from '@/platform/credits'
import { getUserRecentUsage } from '@/platform/analytics'
import { toolRegistry } from '@/tools'
import { db } from '@/db/client'
import { creditTransactions } from '@/db/schema'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/dashboard')

  const userId = session.user.id

  const [balance, recentUsage, recentTransactions] = await Promise.all([
    getBalance(userId),
    getUserRecentUsage(userId, 6),
    db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(5),
  ])

  const recentTools = recentUsage.flatMap(({ toolSlug, usedAt }) => {
    const manifest = toolRegistry.getManifest(toolSlug)
    return manifest ? [{ manifest, usedAt }] : []
  })

  const isEmpty = recentTools.length === 0 && recentTransactions.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {session.user.name && (
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}.</p>
        )}
      </header>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Credits</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{balance.toLocaleString()}</p>
          <Link href="/billing" className="text-xs text-primary hover:underline mt-2 block">
            Buy more →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tools used (recent)</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{recentUsage.length}</p>
          <Link href="/" className="text-xs text-primary hover:underline mt-2 block">
            Browse tools →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Available tools</p>
          <p className="text-3xl font-bold tabular-nums mt-1">{toolRegistry.size()}</p>
          <Link href="/" className="text-xs text-primary hover:underline mt-2 block">
            See all →
          </Link>
        </div>
      </div>

      {/* Recently used tools */}
      {recentTools.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Recently used</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map(({ manifest, usedAt }) => (
              <li key={`${manifest.slug}-${usedAt.getTime()}`}>
                <Link
                  href={`/tools/${manifest.slug}`}
                  className="flex flex-col gap-1 p-4 rounded-lg border border-border hover:bg-muted transition-colors h-full"
                >
                  <p className="font-medium text-sm">{manifest.name}</p>
                  <p className="text-xs text-muted-foreground mt-auto">
                    {usedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Credit history */}
      {recentTransactions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Credit history</h2>
          <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3 bg-card">
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.createdAt.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isEmpty && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-2">No activity yet.</p>
          <Link href="/" className="text-sm text-primary hover:underline">
            Try your first tool →
          </Link>
        </div>
      )}
    </div>
  )
}
