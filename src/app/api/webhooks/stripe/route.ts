import { handleStripeWebhook } from '@/platform/billing'

// Raw body required for Stripe signature verification — do not parse as JSON.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return handleStripeWebhook(req)
}
