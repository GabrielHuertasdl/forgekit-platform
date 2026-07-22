import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/platform/auth'
import { getBalance } from '@/platform/credits'
import { getCreditPacks } from '@/platform/billing'
import { BuyCreditsForm } from './buy-credits-form'

export const metadata: Metadata = { title: 'Billing & Credits' }

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string; pack?: string }>
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
      <h1 className="text-2xl font-bold tracking-tight mb-2">Credits</h1>

      {params.success && (
        <div className="mb-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Payment successful — credits added to your account.
        </div>
      )}
      {params.canceled && (
        <div className="mb-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Checkout canceled. No charge was made.
        </div>
      )}

      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Current balance</p>
        <p className="text-4xl font-bold tabular-nums mt-1">{balance.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">credits</p>
      </div>

      {packs.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold mb-4">Buy credits</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {packs.map((pack) => (
              <div key={pack.id} className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
                <div>
                  <p className="font-semibold">{pack.name}</p>
                  <p className="text-2xl font-bold tabular-nums mt-1">
                    {pack.credits.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">credits</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${(pack.priceUsd / 100).toFixed(2)}
                  </p>
                </div>
                <BuyCreditsForm packId={pack.id} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          No credit packs are configured yet. Set{' '}
          <code className="font-mono bg-muted px-1 rounded">STRIPE_PRICE_*</code> in your environment.
        </p>
      )}
    </div>
  )
}
