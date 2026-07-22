import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import * as schema from './schema'

function createDb() {
  const sql = postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 1,
  })
  return drizzle(sql, { schema })
}

// Module-level singleton. Next.js module cache prevents duplicate connections
// in both dev (hot reload) and production.
let _db: ReturnType<typeof createDb> | undefined

export function getDb(): ReturnType<typeof createDb> {
  if (!_db) _db = createDb()
  return _db
}

export const db = getDb()

export type Db = typeof db
/** Exact type of the transaction object passed to db.transaction() callbacks. */
export type DbTransaction = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
