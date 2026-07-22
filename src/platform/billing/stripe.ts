import Stripe from 'stripe'
import { env } from '@/lib/env'

let _client: Stripe | null = null

export function getStripe(): Stripe {
  if (!_client) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set. Configure billing in .env before using Stripe.')
    }
    _client = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
      typescript: true,
    })
  }
  return _client
}
