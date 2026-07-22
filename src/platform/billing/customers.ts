import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { stripeCustomers, users } from '@/db/schema'
import { getStripe } from './stripe'

export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const existing = await db.query.stripeCustomers.findFirst({
    where: eq(stripeCustomers.userId, userId),
  })

  if (existing) {
    return existing.stripeCustomerId
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, name: true },
  })

  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId },
  })

  await db.insert(stripeCustomers).values({
    userId,
    stripeCustomerId: customer.id,
  })

  return customer.id
}
