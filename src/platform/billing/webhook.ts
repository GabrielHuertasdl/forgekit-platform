import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { stripeEvents } from '@/db/schema'
import { env } from '@/lib/env'
import { addCredits } from '@/platform/credits'
import { getStripe } from './stripe'

async function handleCheckoutCompleted(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  session: Stripe.Checkout.Session,
) {
  const { userId, credits } = session.metadata ?? {}
  if (!userId || !credits) return

  const amount = parseInt(credits, 10)
  if (isNaN(amount) || amount <= 0) return

  await addCredits(userId, amount, 'purchase', session.id, tx)
}

export async function handleStripeWebhook(req: Request): Promise<Response> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  // Idempotency: skip already-processed events
  const existing = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.id, event.id),
  })
  if (existing) {
    return new Response('Already processed', { status: 200 })
  }

  await db.transaction(async (tx) => {
    await tx.insert(stripeEvents).values({ id: event.id, type: event.type })

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(tx, event.data.object as Stripe.Checkout.Session)
    }
  })

  return new Response('OK', { status: 200 })
}
