import { env } from '@/lib/env'
import { getCreditPack } from './packs'
import { getOrCreateStripeCustomer } from './customers'
import { getStripe } from './stripe'

export interface CheckoutResult {
  url: string
}

export async function createCheckoutSession(
  userId: string,
  packId: string,
): Promise<CheckoutResult> {
  const pack = getCreditPack(packId)
  if (!pack) {
    throw new Error(`Credit pack "${packId}" not found or not configured.`)
  }

  const customerId = await getOrCreateStripeCustomer(userId)
  const appUrl = env.NEXT_PUBLIC_APP_URL

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: pack.stripePriceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${appUrl}/billing?success=1&pack=${packId}`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    metadata: {
      userId,
      packId,
      credits: pack.credits.toString(),
    },
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.')
  }

  return { url: session.url }
}
