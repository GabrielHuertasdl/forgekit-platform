import { env } from '@/lib/env'

export interface CreditPack {
  id: string
  name: string
  credits: number
  /** Price in USD cents. */
  priceUsd: number
  stripePriceId: string
}

export function getCreditPacks(): CreditPack[] {
  return [
    {
      id: 'starter',
      name: 'Starter',
      credits: 100,
      priceUsd: 99,
      stripePriceId: env.STRIPE_PRICE_STARTER ?? '',
    },
    {
      id: 'pro',
      name: 'Pro',
      credits: 500,
      priceUsd: 399,
      stripePriceId: env.STRIPE_PRICE_PRO ?? '',
    },
    {
      id: 'power',
      name: 'Power',
      credits: 2000,
      priceUsd: 1299,
      stripePriceId: env.STRIPE_PRICE_POWER ?? '',
    },
  ].filter((pack) => pack.stripePriceId !== '')
}

export function getCreditPack(id: string): CreditPack | undefined {
  return getCreditPacks().find((p) => p.id === id)
}
