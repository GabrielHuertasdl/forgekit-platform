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
import { ToolCard } from '@/ui/components/shared/tool-card'

export const metadata: Metadata = { title: 'Dashboard — ForgeKit' }

const RECOMMENDED_SLUGS = [
  'password-generator',
  'json-formatter',
  'case-converter',
  'text-counter',
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/dashboard')

  const userId = session.user.id
  const firstName = session.user.name?.split(' ')[0] ?? session.user.name ?? ''

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

  const recommendedManifests = RECOMMENDED_SLUGS.flatMap((slug) => {
    const m = toolRegistry.getManifest(slug)
    return m ? [m] : []
  })

  const hasActivity = recentTools.length > 0 || recentTransactions.length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}{firstName ? ',' : ''}</p>
          <h1 className="text-2xl font-bold tracking-tight">{firstName || 'Welcome back'}</h1>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Explore tools →
        </Link>
      </div>

      {/* Quick search */}
      <form action="/" method="GET" className="mb-8">
        <input
          type="search"
          name="q"
          placeholder="Search all tools…"
          className="w-full h-10 px-4 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search tools"
          autoComplete="off"
        />
      </form>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Credits</p>
          <p className="text-4xl font-bold tabular-nums mt-1">{balance.toLocaleString()}</p>
          <Link href="/billing" className="text-xs text-primary hover:underline mt-2 block">
            Buy more credits →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tools used</p>
          <p className="text-4xl font-bold tabular-nums mt-1">{recentUsage.length}</p>
          <Link href="/" className="text-xs text-primary hover:underline mt-2 block">
            Browse all tools →
          </Link>
        </div>
      </div>

      {/* Recently used */}
      {recentTools.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Continue where you left off
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map(({ manifest, usedAt }) => (
              <li key={`${manifest.slug}-${usedAt.getTime()}`}>
                <ToolCard manifest={manifest} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommended (shown when no history) */}
      {recentTools.length === 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Start here
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedManifests.map((m) => (
              <li key={m.slug}>
                <ToolCard manifest={m} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Credit history */}
      {recentTransactions.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Credit history
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
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
                    tx.amount > 0 ? 'text-green-600' : 'text-foreground'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/billing" className="text-xs text-primary hover:underline mt-3 block">
            Manage credits →
          </Link>
        </section>
      )}

      {!hasActivity && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-base font-medium mb-1">No activity yet.</p>
          <p className="text-sm mb-4">Try one of the tools above to get started.</p>
        </div>
      )}
    </div>
  )
}
