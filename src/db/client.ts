import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import * as schema from './schema'

declare global {
  var __db: ReturnType<typeof drizzle> | undefined
}

function createDb() {
  const sql = postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 1,
  })
  return drizzle(sql, { schema })
}

export const db = globalThis.__db ?? createDb()

if (env.NODE_ENV !== 'production') {
  globalThis.__db = db
}

export type Db = typeof db
