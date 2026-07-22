import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const stripeCustomers = pgTable('stripe_customers', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** Positive = credit added. Negative = credit deducted. */
  amount: integer('amount').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  type: text('type', { enum: ['purchase', 'debit', 'bonus', 'refund'] }).notNull(),
  toolSlug: text('tool_slug'),
  stripeEventId: text('stripe_event_id'),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

/** Idempotency log for processed Stripe webhook events. */
export const stripeEvents = pgTable('stripe_events', {
  id: text('id').primaryKey(), // Stripe event ID (evt_...)
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', { mode: 'date' }).notNull().defaultNow(),
})

export const stripeCustomersRelations = relations(stripeCustomers, ({ one }) => ({
  user: one(users, { fields: [stripeCustomers.userId], references: [users.id] }),
}))

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, { fields: [creditTransactions.userId], references: [users.id] }),
}))

export type StripeCustomer = typeof stripeCustomers.$inferSelect
export type CreditTransaction = typeof creditTransactions.$inferSelect
export type NewCreditTransaction = typeof creditTransactions.$inferInsert
