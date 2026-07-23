import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/platform/auth'
import { getBalance } from '@/platform/credits'
import { getCreditPacks } from '@/platform/billing'
import { BuyCreditsForm } from './buy-credits-form'

export const metadata: Metadata = { title: 'Credits & Billing — ForgeKit' }

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/billing')

  const [balance, packs, params] = await Promise.all([
    getBalance(session.user.id),
    Promise.resolve(getCreditPacks()),
    searchParams,
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Credits</h1>
      <p className="text-sm text-muted-foreground mb-8">
        One-time purchase. No subscription. Credits never expire.
      </p>

      {params.success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
          ✓ Payment successful — credits added to your account.
        </div>
      )}
      {params.canceled && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Checkout canceled. No charge was made.
        </div>
      )}

      {/* Balance card */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Current balance</p>
        <p className="text-5xl font-bold tabular-nums">{balance.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-1">credits</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 mt-3">
          ✓ Credits never expire
        </span>
      </div>

      {/* What credits unlock */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">What can I do with credits?</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Run AI-powered analysis and generation tools
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Process large files and datasets
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Access premium export formats
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            Unlock priority processing for faster results
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          All current tools are free. Credits unlock future premium features.
        </p>
      </div>

      {/* Packs */}
      {packs.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold mb-1">Top up your credits</h2>
          <p className="text-xs text-muted-foreground mb-4">Pay once, use anytime. No subscription required.</p>

          <div className="grid gap-4 sm:grid-cols-3">
            {packs.map((pack) => {
              const isBest = pack.id === 'pro'
              const centsPerCredit = ((pack.priceUsd / 100) / pack.credits * 100).toFixed(1)

              return (
                <div
                  key={pack.id}
                  className={`rounded-xl border bg-card p-5 flex flex-col gap-4 relative ${
                    isBest ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Best value
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{pack.name}</p>
                    <p className="text-3xl font-bold tabular-nums mt-1">
                      {pack.credits.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">credits</span>
                    </p>
                    <p className="text-xl font-semibold mt-1">
                      ${(pack.priceUsd / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {centsPerCredit}¢ per credit
                    </p>
                  </div>
                  <BuyCreditsForm packId={pack.id} />
                </div>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Secure checkout via Stripe. Credits are added instantly after payment.
          </p>
        </section>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Credit packs are coming soon.{' '}
            <span className="font-medium text-foreground">All tools are currently free.</span>
          </p>
        </div>
      )}
    </div>
  )
}
