import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const toolUsageEvents = pgTable(
  'tool_usage_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** Null when unauthenticated user runs a free tool. */
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    toolSlug: text('tool_slug').notNull(),
    creditsSpent: integer('credits_spent').notNull().default(0),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_tool_usage_user_created').on(table.userId, table.createdAt),
    index('idx_tool_usage_tool_slug').on(table.toolSlug),
  ],
)

export const toolUsageEventsRelations = relations(toolUsageEvents, ({ one }) => ({
  user: one(users, { fields: [toolUsageEvents.userId], references: [users.id] }),
}))

export type ToolUsageEvent = typeof toolUsageEvents.$inferSelect
