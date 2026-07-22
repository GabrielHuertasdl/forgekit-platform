import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { toolUsageEvents } from '@/db/schema'

export interface RecentUsageEntry {
  toolSlug: string
  creditsSpent: number
  usedAt: Date
}

/**
 * Fire-and-forget analytics write. Never throws — a tracking failure must
 * not block the tool use response.
 */
export async function trackToolUsage(
  userId: string | null,
  toolSlug: string,
  creditsSpent = 0,
): Promise<void> {
  try {
    await db.insert(toolUsageEvents).values({ userId, toolSlug, creditsSpent })
  } catch (err) {
    console.error('[analytics] Failed to record tool usage:', err)
  }
}

export async function getUserRecentUsage(
  userId: string,
  limit = 10,
): Promise<RecentUsageEntry[]> {
  return db
    .select({
      toolSlug: toolUsageEvents.toolSlug,
      creditsSpent: toolUsageEvents.creditsSpent,
      usedAt: toolUsageEvents.createdAt,
    })
    .from(toolUsageEvents)
    .where(eq(toolUsageEvents.userId, userId))
    .orderBy(desc(toolUsageEvents.createdAt))
    .limit(limit)
}

export async function getToolUsageCount(toolSlug: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolUsageEvents)
    .where(eq(toolUsageEvents.toolSlug, toolSlug))
  return row?.count ?? 0
}
