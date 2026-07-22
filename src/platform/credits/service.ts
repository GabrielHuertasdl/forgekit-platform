import { and, eq, gte, sql } from 'drizzle-orm'
import { db, type DbTransaction } from '@/db/client'
import { users, creditTransactions } from '@/db/schema'

export type DeductResult =
  | { success: true; newBalance: number }
  | { success: false; reason: 'insufficient_credits' }

export async function getBalance(userId: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { creditsBalance: true },
  })
  return user?.creditsBalance ?? 0
}

export async function deductCredits(
  userId: string,
  amount: number,
  toolSlug: string,
): Promise<DeductResult> {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        creditsBalance: sql`${users.creditsBalance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), gte(users.creditsBalance, amount)))
      .returning({ newBalance: users.creditsBalance })

    if (!updated) {
      return { success: false, reason: 'insufficient_credits' as const }
    }

    await tx.insert(creditTransactions).values({
      userId,
      amount: -amount,
      balanceAfter: updated.newBalance,
      type: 'debit',
      toolSlug,
      description: `Used tool: ${toolSlug}`,
    })

    return { success: true, newBalance: updated.newBalance }
  })
}

/**
 * Add credits to a user. Accepts an optional `tx` to run inside an existing
 * transaction (e.g. from the Stripe webhook handler).
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund',
  stripeEventId?: string,
  tx?: DbTransaction,
): Promise<number> {
  const client = (tx ?? db) as typeof db

  const [updated] = await client
    .update(users)
    .set({
      creditsBalance: sql`${users.creditsBalance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ newBalance: users.creditsBalance })

  if (!updated) {
    throw new Error(`User ${userId} not found when adding credits.`)
  }

  const descriptions = {
    purchase: `Purchased ${amount} credits`,
    bonus: `Bonus: ${amount} credits`,
    refund: `Refund: ${amount} credits`,
  }

  await client.insert(creditTransactions).values({
    userId,
    amount,
    balanceAfter: updated.newBalance,
    type,
    stripeEventId,
    description: descriptions[type],
  })

  return updated.newBalance
}
