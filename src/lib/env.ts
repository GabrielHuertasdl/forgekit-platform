import { z } from 'zod'

const envSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Redis (Phase 2)
  REDIS_URL: z.string().url().optional(),

  // Stripe (Phase 2)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
