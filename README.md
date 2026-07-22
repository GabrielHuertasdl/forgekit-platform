# ForgeKit

Modular platform for micro-tools. One codebase, shared auth + billing + credits + analytics + SEO. Add a new tool in ~30 minutes. Scale to 1,000+ tools without touching platform code.

---

## Table of Contents

1. [What it is](#1-what-it-is)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [Running locally](#4-running-locally)
5. [Adding a new tool](#5-adding-a-new-tool)
6. [Tool manifest reference](#6-tool-manifest-reference)
7. [Credits and billing system](#7-credits-and-billing-system)
8. [How to monetize](#8-how-to-monetize)
9. [Stripe setup (step by step)](#9-stripe-setup-step-by-step)
10. [Database schema](#10-database-schema)
11. [API endpoints](#11-api-endpoints)
12. [Auth architecture](#12-auth-architecture)
13. [Search system](#13-search-system)
14. [SEO / AEO system](#14-seo--aeo-system)
15. [Analytics](#15-analytics)
16. [Testing](#16-testing)
17. [Deployment (Vercel)](#17-deployment-vercel)
18. [Known gaps and next priorities](#18-known-gaps-and-next-priorities)

---

## 1. What it is

ForgeKit is a **micro-tools platform**: a collection of small, focused utilities that share infrastructure. Instead of building and hosting dozens of separate apps, you build tools once and drop them into ForgeKit. They automatically get:

- A URL at `/tools/[slug]`
- Auth (optional, tool-level)
- Credit billing (optional, tool-level)
- Usage analytics
- SEO metadata + JSON-LD schema + Open Graph image
- Appearance in search and on the home page

Currently live tools:

| Slug | Name | Credits | Category |
|---|---|---|---|
| `text-counter` | Text Counter | 0 (free) | text |
| `json-formatter` | JSON Formatter | 0 (free) | developer |
| `base64-encoder` | Base64 Encoder/Decoder | 0 (free) | conversion |
| `url-encoder` | URL Encoder/Decoder | 0 (free) | developer |

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Server components, SSR, file-based routing |
| Language | TypeScript strict | `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` |
| Database | PostgreSQL + Drizzle ORM | Type-safe queries, atomic transactions, migrations |
| Auth | NextAuth.js v5 + DrizzleAdapter | Google OAuth out of the box, JWT sessions |
| Styling | Tailwind CSS v4 + CSS variables | Theme-aware, no config files, fast |
| Components | shadcn/ui pattern (Radix primitives) | Accessible, unstyled-first |
| Billing | Stripe v22 | Credit pack purchases, webhook idempotency |
| Testing | Vitest | Fast, ESM-native, `@/*` alias support |
| DB migrations | Drizzle Kit | SQL migration files tracked in git |

---

## 3. Project structure

```
ForgeKit/
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── (marketing)/              # Public, unauthenticated pages
│   │   │   └── page.tsx              # Home page — lists all active tools
│   │   ├── (app)/                    # Authenticated shell (layout has auth check)
│   │   │   ├── layout.tsx            # Shared authenticated layout
│   │   │   ├── dashboard/            # User dashboard (/dashboard)
│   │   │   ├── billing/              # Billing page (/billing)
│   │   │   └── tools/[slug]/         # Tool renderer (/tools/json-formatter etc.)
│   │   │       ├── page.tsx          # Tool page: metadata, JSON-LD, Component render
│   │   │       └── opengraph-image.tsx  # Dynamic 1200×630 OG image per tool
│   │   ├── (auth)/                   # Auth pages (sign-in)
│   │   │   └── sign-in/page.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   │   ├── billing/checkout/     # POST → Stripe Checkout session
│   │   │   ├── credits/balance/      # GET → user credit balance
│   │   │   ├── tools/[slug]/use/     # POST → deduct credits + track analytics
│   │   │   ├── tools/search/         # GET → search tools by query
│   │   │   └── webhooks/stripe/      # POST → Stripe webhook (credit top-ups)
│   │   ├── layout.tsx                # Root layout: fonts, globals.css
│   │   ├── globals.css               # Tailwind v4 + CSS theme variables
│   │   ├── sitemap.ts                # Dynamic sitemap (all active tools)
│   │   ├── robots.ts                 # robots.txt (disallows /dashboard, /billing)
│   │   ├── error.tsx                 # Global error boundary
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── platform/                     # Shared platform services (never imported by tool components)
│   │   ├── auth/                     # Re-exports from src/auth.ts
│   │   │   ├── index.ts              # Public API: auth, signIn, signOut, handlers
│   │   │   └── types.ts              # AuthUser type
│   │   ├── billing/
│   │   │   ├── stripe.ts             # Stripe singleton (lazy init)
│   │   │   ├── customers.ts          # getOrCreateStripeCustomer
│   │   │   ├── checkout.ts           # createCheckoutSession
│   │   │   ├── webhook.ts            # handleStripeWebhook (signature + idempotency)
│   │   │   ├── packs.ts              # getCreditPacks() — pack definitions
│   │   │   └── index.ts              # Public exports
│   │   ├── credits/
│   │   │   ├── service.ts            # getBalance, deductCredits, addCredits
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   ├── service.ts            # trackToolUsage, getUserRecentUsage, getToolUsageCount
│   │   │   └── index.ts
│   │   └── search/
│   │       ├── service.ts            # searchTools() — in-memory scoring
│   │       └── index.ts
│   │
│   ├── tools/                        # All tool modules
│   │   ├── _registry/
│   │   │   ├── types.ts              # ToolManifest, ToolProps, ToolModule interfaces
│   │   │   ├── registry.ts           # ToolRegistry class
│   │   │   └── index.ts              # Public exports
│   │   ├── index.ts                  # Bootstrap: registers ALL tools (add new ones here)
│   │   ├── text-counter/             # Tool: text-counter
│   │   ├── json-formatter/           # Tool: json-formatter
│   │   ├── base64-encoder/           # Tool: base64-encoder
│   │   └── url-encoder/              # Tool: url-encoder
│   │
│   ├── db/
│   │   ├── client.ts                 # Singleton db connection (postgres.js)
│   │   ├── seed.ts                   # Dev seed: creates dev@forgekit.local w/ 500 credits
│   │   └── schema/
│   │       ├── users.ts              # users, accounts, sessions, verificationTokens
│   │       ├── billing.ts            # stripe_customers, credit_transactions, stripe_events
│   │       ├── analytics.ts          # tool_usage_events
│   │       └── index.ts              # Re-exports all tables
│   │
│   ├── ui/
│   │   └── components/
│   │       ├── ui/                   # Primitive components (Button, etc.)
│   │       └── shared/               # ForgeKit-specific shared components (ToolCard)
│   │
│   ├── lib/
│   │   ├── env.ts                    # Typed env validation via Zod
│   │   └── utils.ts                  # cn(), slugify(), assertNever()
│   │
│   ├── auth.config.ts                # Edge-compatible auth config (no DB)
│   ├── auth.ts                       # Full auth with DrizzleAdapter
│   └── middleware.ts                 # Route protection (4 lines — uses auth.config.ts)
│
├── drizzle/                          # Migration SQL files (tracked in git)
│   └── 0000_cool_timeslip.sql        # Initial schema: 8 tables
├── tests/
│   └── tools/                        # Unit tests per tool (logic.ts only)
├── .env.example                      # Template for environment variables
├── start.sh                          # First-run setup script
├── drizzle.config.ts
├── vitest.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 4. Running locally

```bash
# First time
./start.sh
# Handles: .env creation, AUTH_SECRET generation, DATABASE_URL prompt, npm install,
# db:push, optional seed, npm run dev

# Subsequent runs
npm run dev          # http://localhost:3000

# Useful commands
npm run typecheck    # tsc --noEmit (zero errors enforced)
npm run lint         # ESLint
npm run test         # Vitest (40 unit tests)
npm run db:studio    # Drizzle Studio GUI at https://local.drizzle.studio
npm run db:seed      # Re-seed dev user
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | 32-byte random secret for JWT signing. Run: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | For OAuth | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | For OAuth | Google OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of the app (e.g. `https://forgekit.com`) |
| `STRIPE_SECRET_KEY` | For billing | Stripe secret key (`sk_test_...` in dev) |
| `STRIPE_WEBHOOK_SECRET` | For billing | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe publishable key |
| `STRIPE_PRICE_STARTER` | Optional | Stripe Price ID for 100-credit pack |
| `STRIPE_PRICE_PRO` | Optional | Stripe Price ID for 500-credit pack |
| `STRIPE_PRICE_POWER` | Optional | Stripe Price ID for 2000-credit pack |

**Database options (no local PostgreSQL installed):**

- **Neon** (free, serverless): neon.tech → New project → Connection string
- **Supabase** (free tier): supabase.com → Project Settings → Database → URI
- **Docker local**: `docker run -d --name forgekit-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=forgekit -p 5432:5432 postgres:16` → `DATABASE_URL=postgresql://postgres:secret@localhost:5432/forgekit`

---

## 5. Adding a new tool

Every tool lives in its own directory under `src/tools/[slug]/`. Four files, always the same pattern.

### Step 1 — manifest.ts

```typescript
// src/tools/my-tool/manifest.ts
import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'my-tool',              // PERMANENT. Never change. URL + DB key.
  name: 'My Tool',
  description: 'One line shown on cards and in SEO descriptions.',
  longDescription: 'Paragraph shown below the tool. Good for SEO.',
  category: 'developer',        // See categories list below
  stateMode: 'stateless',       // 'stateless' or 'workspaceAware'
  status: 'active',             // 'active' | 'beta' | 'deprecated' | 'coming_soon'
  version: '1.0.0',
  creditsPerUse: 0,             // 0 = free. Any integer = paid.
  isPremium: false,
  tags: ['my-tool', 'utility'],
  icon: 'Wrench',               // Any Lucide icon name: lucide.dev/icons
  keywords: [
    'my tool online',
    'free my tool',
  ],
}
```

**Available categories:** `text` · `image` · `code` · `data` · `productivity` · `developer` · `ai` · `conversion` · `security` · `math`

### Step 2 — logic.ts

Pure functions only. No React, no imports from `@/platform/*`. This is what gets unit-tested.

```typescript
// src/tools/my-tool/logic.ts
export interface MyResult {
  output: string
  // ...
}

export function processMyTool(input: string): MyResult {
  // pure logic here
  return { output: input.toUpperCase() }
}
```

### Step 3 — component.tsx

```typescript
// src/tools/my-tool/component.tsx
'use client'

import { useState } from 'react'
import { processMyTool } from './logic'
import type { ToolProps } from '@/tools/_registry'

export function MyTool({ userId }: ToolProps) {
  const [input, setInput] = useState('')
  const result = processMyTool(input)

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <p>{result.output}</p>
    </div>
  )
}
```

`ToolProps` gives you `userId?: string`. It's `undefined` if the user is not logged in (free tool). Use it to gate paid features or persist workspace state.

### Step 4 — index.ts

```typescript
// src/tools/my-tool/index.ts
import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { MyTool } from './component'

const toolModule: ToolModule = { manifest, Component: MyTool }
export default toolModule
```

### Step 5 — Register in src/tools/index.ts

```typescript
import myToolModule from './my-tool'
toolRegistry.register(myToolModule)
```

That's it. The tool now:
- Appears at `/tools/my-tool`
- Is listed on the home page
- Has a generated OG image at `/tools/my-tool/opengraph-image`
- Is in the sitemap
- Has JSON-LD schema markup
- Is searchable via the search API

### Step 6 — Write tests

```typescript
// tests/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest'
import { processMyTool } from '@/tools/my-tool/logic'

describe('processMyTool', () => {
  it('uppercases text', () => {
    expect(processMyTool('hello').output).toBe('HELLO')
  })
})
```

---

## 6. Tool manifest reference

```typescript
interface ToolManifest {
  slug: string          // Permanent URL slug and DB key. NEVER change after release.
  name: string          // Display name
  description: string   // Short (shown on cards, meta description)
  longDescription: string // Long (shown below tool, good for SEO)
  category: ToolCategory
  stateMode: 'stateless' | 'workspaceAware'
  // stateless: no user data stored. No auth required for free tools.
  // workspaceAware: persists data per user. Requires auth.
  status: 'active' | 'beta' | 'deprecated' | 'coming_soon'
  // deprecated: 404s on the tool page
  // coming_soon: visible on listings but tool page shows placeholder
  version: string       // Semantic version. Informational only.
  creditsPerUse: number // 0 = free. >0 = deducted on each POST /api/tools/[slug]/use
  isPremium: boolean    // Reserved for future premium-only gating
  tags: string[]        // Shown as pills below tool description
  icon: string          // Lucide icon name: lucide.dev/icons
  keywords: string[]    // SEO keywords injected into <head> and JSON-LD
}
```

---

## 7. Credits and billing system

### How credits flow

```
User buys a credit pack
  → Stripe Checkout session created (/api/billing/checkout)
  → User pays
  → Stripe sends webhook (checkout.session.completed)
  → /api/webhooks/stripe verifies signature
  → DB transaction: insert stripe_events (idempotency) + update users.credits_balance
  → User now has credits

User uses a paid tool
  → Tool component calls POST /api/tools/[slug]/use
  → Server reads manifest.creditsPerUse
  → Atomic SQL: UPDATE users SET credits_balance = credits_balance - N WHERE credits_balance >= N
  → If no rows updated → 402 Insufficient Credits
  → If updated → insert credit_transactions record + fire analytics event
```

### Credit packs (configurable in src/platform/billing/packs.ts)

| Pack | Credits | Price | Stripe Price Env Var |
|---|---|---|---|
| Starter | 100 | $0.99 | `STRIPE_PRICE_STARTER` |
| Pro | 500 | $3.99 | `STRIPE_PRICE_PRO` |
| Power | 2,000 | $12.99 | `STRIPE_PRICE_POWER` |

Packs with an empty/missing `STRIPE_PRICE_*` env var are **hidden** from the billing page automatically. Deploy all three or just one.

### Changing pack prices or credits

Edit `src/platform/billing/packs.ts`. Create matching one-time prices in the Stripe dashboard, paste the Price IDs into your env vars. No code changes needed beyond `packs.ts`.

### Making a free tool paid

In the tool's `manifest.ts`, set `creditsPerUse` to any integer > 0. That's it. The tool page will show the credit cost, and the `/use` endpoint will enforce deduction automatically.

### Giving users free credits (bonus/welcome credits)

```typescript
import { addCredits } from '@/platform/credits'

await addCredits(userId, 50, 'bonus')
// or 'purchase' | 'refund'
```

---

## 8. How to monetize

### Option A — Credits model (already built)

Users buy credit packs via Stripe. Paid tools deduct credits on use. This is fully implemented.

**To activate:**
1. Complete Stripe setup (see section 9)
2. Set `creditsPerUse > 0` on any tool that should cost credits
3. Set the 3 `STRIPE_PRICE_*` env vars

**Pricing strategy:**
- Use free tools (creditsPerUse: 0) as acquisition — they drive SEO traffic
- Gate advanced features or AI-powered tools behind credits
- Offer a welcome bonus (e.g. 25 free credits on signup) to reduce friction

### Option B — Subscription model (not yet built)

Add a `subscriptionTier` column to `users`. Gate tools by checking `isPremium: true` on the manifest plus the user's tier. Monthly Stripe subscriptions instead of one-time packs.

### Option C — Ads on free tools

Since free tools require no auth, they get the most traffic. Add an ad slot to the tool page layout (`src/app/(app)/tools/[slug]/page.tsx`) for users who are not logged in.

### Option D — API access (not yet built)

Expose tool logic via authenticated API endpoints. Sell API keys by the credit or by the month. The credit ledger already supports programmatic `addCredits`/`deductCredits`.

### Option E — White-labeling / embedding

Tools are self-contained React components that receive `ToolProps`. They can be embedded in any Next.js app that imports the module. License the toolkit.

---

## 9. Stripe setup (step by step)

### Development (test mode)

1. Create a Stripe account at stripe.com
2. Go to **Developers → API keys** → copy `sk_test_...` and `pk_test_...`
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
4. Create one-time prices:
   - Stripe Dashboard → **Products** → **Add product**
   - Name: "Starter Pack" · Price: $0.99 · One time · No trial
   - Click **Add price** → copy the Price ID (`price_...`)
   - Repeat for Pro ($3.99) and Power ($12.99)
5. Add Price IDs to `.env`:
   ```
   STRIPE_PRICE_STARTER="price_..."
   STRIPE_PRICE_PRO="price_..."
   STRIPE_PRICE_POWER="price_..."
   ```
6. Set up local webhook forwarding:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # Copy the whsec_... value shown
   ```
7. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### Production

1. Switch Stripe to **Live mode** → get `sk_live_...` and `pk_live_...`
2. Create same products/prices in live mode
3. Register webhook endpoint in Stripe Dashboard:
   - **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen: `checkout.session.completed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`
4. Update all env vars in Vercel/hosting

### Testing a purchase locally

```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed
# Or use Stripe's test card: 4242 4242 4242 4242
```

---

## 10. Database schema

8 tables total. One migration file: `drizzle/0000_cool_timeslip.sql`.

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | Auto-generated |
| email | text UNIQUE | Required |
| name | text | From OAuth provider |
| image | text | Avatar URL |
| email_verified | timestamp | Set by NextAuth |
| credits_balance | integer | Default 0. Never goes below 0 (atomic SQL) |
| is_admin | boolean | Default false. Reserved for admin panel |
| created_at | timestamp | |
| updated_at | timestamp | |

### accounts
NextAuth OAuth account links (Google, etc). One row per OAuth provider per user.

### sessions
NextAuth session tokens. Present even with JWT strategy — DrizzleAdapter manages cleanup.

### verification_tokens
Email magic-link tokens (for future email provider).

### stripe_customers
| Column | Notes |
|---|---|
| user_id (PK) | FK → users |
| stripe_customer_id | Stripe Customer object ID |

Created lazily on first checkout. One Stripe customer per user.

### credit_transactions
Full ledger of every credit movement.

| Column | Notes |
|---|---|
| id | uuid PK |
| user_id | FK → users |
| amount | Positive = added, negative = deducted |
| balance_after | Balance snapshot after this transaction |
| type | `purchase` / `debit` / `bonus` / `refund` |
| tool_slug | Set on `debit` rows |
| stripe_event_id | Set on `purchase` rows (idempotency link) |
| description | Human-readable |

### stripe_events
Idempotency log. Before processing any webhook, the event ID is inserted here. If it already exists, the webhook is silently skipped. This prevents double-crediting on retries.

### tool_usage_events
| Column | Notes |
|---|---|
| id | uuid PK |
| user_id | Nullable (anonymous free tool uses) |
| tool_slug | Which tool was used |
| credits_spent | 0 for free tools |
| created_at | Event timestamp |

Indexed on `(tool_slug, created_at)` and `(user_id, created_at)`.

### Adding columns to the schema

1. Edit the relevant file in `src/db/schema/`
2. Run `npm run db:generate` → creates a new SQL file in `drizzle/`
3. Run `npm run db:migrate` to apply (or `npm run db:push` in dev)
4. Commit both the schema change and the migration file

---

## 11. API endpoints

### `POST /api/billing/checkout`

Creates a Stripe Checkout session. Requires auth.

**Body:** `{ packId: 'starter' | 'pro' | 'power' }`

**Response:** `{ url: string }` — redirect the user to this URL

### `GET /api/credits/balance`

Returns the current user's credit balance. Requires auth.

**Response:** `{ balance: number }`

### `POST /api/tools/[slug]/use`

Deducts credits (if any) and records analytics. Call this from tool components before executing paid operations.

**Response (free tool):** `{ success: true }`

**Response (paid tool, success):** `{ success: true, newBalance: number }`

**Response (paid tool, no credits):** `{ error: 'Insufficient credits', creditsNeeded: number }` — HTTP 402

**Response (not authenticated):** HTTP 401

### `GET /api/tools/search?q=json&category=developer&limit=10`

Searches active tools by name, tags, keywords, and description.

**Query params:** `q` (search query), `category` (optional filter), `limit` (default 20)

**Response:** `ToolManifest[]`

### `POST /api/webhooks/stripe`

Stripe webhook receiver. Handles `checkout.session.completed`. Verifies signature, checks idempotency, credits user in a single DB transaction.

### `GET/POST /api/auth/[...nextauth]`

NextAuth.js handler. Manages OAuth callbacks, session creation, token refresh.

---

## 12. Auth architecture

Two files, both required:

### src/auth.config.ts (Edge-compatible)

- No database imports. Runs on Vercel Edge runtime.
- Contains the `authorized` callback — single place for route protection logic.
- Used by `src/middleware.ts`.
- Reads `AUTH_GOOGLE_*` directly from `process.env` (not via `env.ts`) — Edge doesn't need Zod validation overhead.

### src/auth.ts (Node.js only)

- Full NextAuth with `DrizzleAdapter` and `strategy: 'jwt'`.
- JWT strategy: sessions are signed cookies. No DB lookup per request.
- Used by server components and API routes via `@/platform/auth`.

### Protected routes

Defined in `src/auth.config.ts`:

```typescript
const PROTECTED_PREFIXES = ['/dashboard', '/billing']
```

Add any prefix here to require auth. The middleware handles the redirect to `/sign-in?callbackUrl=...` automatically.

### Getting the current user in a server component or API route

```typescript
import { auth } from '@/platform/auth'

const session = await auth()
const userId = session?.user?.id  // undefined if not logged in
```

### Adding another OAuth provider (GitHub, etc.)

1. Install: `npm install @auth/github-provider` (or use the built-in next-auth providers)
2. Add to `src/auth.config.ts` providers array
3. Add env vars to `.env`
4. Done — DrizzleAdapter handles account linking automatically

---

## 13. Search system

`src/platform/search/service.ts` — in-memory scoring, no external dependencies.

### Scoring algorithm

| Match | Score |
|---|---|
| Name starts with query | +15 |
| Name contains query | +10 |
| Tags contain query | +4 |
| Description contains query | +3 |
| Keywords contain query | +2 |

Tools with score 0 are excluded. Results sorted by score descending.

### Limitations

Works well up to ~500 tools. At scale (1,000+), migrate to PostgreSQL full-text search (`tsvector`). The `searchTools()` function signature stays the same — just swap the implementation.

### Using search in a component

```typescript
// Server component
import { searchTools } from '@/platform/search'

const results = searchTools('json', { category: 'developer', limit: 10 })
```

```typescript
// Client component (via API)
const res = await fetch('/api/tools/search?q=json&limit=5')
const tools: ToolManifest[] = await res.json()
```

---

## 14. SEO / AEO system

Every tool page at `/tools/[slug]` automatically gets:

### Meta tags
Generated by `generateMetadata()` in `src/app/(app)/tools/[slug]/page.tsx`:
- `<title>` — tool name
- `<meta name="description">` — tool description
- `<meta name="keywords">` — tool keywords array
- Open Graph: title, description, type, url
- Twitter Card: summary_large_image

### JSON-LD (SoftwareApplication schema)
Injected via `<script type="application/ld+json">`. Tells search engines and AI crawlers:
- Tool name, description, URL
- Category: UtilityApplication
- Operating system: Any
- Creator: ForgeKit
- Offer with price: 0 USD (for free tools)

AEO (Answer Engine Optimization): the JSON-LD schema helps tools surface in AI search results (Perplexity, SearchGPT, etc.) as structured answers.

### Dynamic Open Graph image
`src/app/(app)/tools/[slug]/opengraph-image.tsx` generates a 1200×630 image per tool using `next/og`. Shown when sharing links on social media.

### Sitemap
`src/app/sitemap.ts` — dynamically includes all active tools. Updated automatically when you add a tool.

### robots.txt
`src/app/robots.ts` — disallows `/dashboard`, `/billing`, `/sign-in`. Allows everything else.

### SEO best practices for new tools

In the tool manifest, write `keywords` as full phrases people actually search:
```typescript
keywords: [
  'json formatter online',      // ← what people type in Google
  'pretty print json',
  'json beautifier free',
  'validate json online',
]
```

Write `longDescription` as a paragraph (2-3 sentences) that answers the question "what is this tool and what does it do?" — this text appears on the page and is indexed.

---

## 15. Analytics

`src/platform/analytics/service.ts`

### trackToolUsage

Called from `/api/tools/[slug]/use` after every tool interaction. Fire-and-forget — errors are caught internally and never block the user.

```typescript
await trackToolUsage(userId, 'json-formatter', 0)
// userId can be null for anonymous (free tool, not logged in)
```

### Querying analytics

```typescript
import { getUserRecentUsage, getToolUsageCount } from '@/platform/analytics'

// Last 10 tool uses by a user
const recent = await getUserRecentUsage(userId, 10)

// Total uses of a tool across all users
const count = await getToolUsageCount('json-formatter')
```

### Building an admin dashboard

All data is in the `tool_usage_events` table. Useful queries:
- Top tools by usage count
- Daily active users (distinct `user_id` per day)
- Revenue per tool (join `credit_transactions` on `tool_slug`)
- New user growth (group `users.created_at` by week)

---

## 16. Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode for development
```

Tests live in `tests/tools/`. Each tool's `logic.ts` file has a corresponding test file.

### Current test coverage

| File | Tests |
|---|---|
| `tests/tools/text-counter.test.ts` | 11 |
| `tests/tools/json-formatter.test.ts` | 11 |
| `tests/tools/base64-encoder.test.ts` | 9 |
| `tests/tools/url-encoder.test.ts` | 9 |
| **Total** | **40** |

### What to test

Only test `logic.ts` files. Components are React UI — test them with Playwright or manual testing. Platform services (credits, billing, analytics) require a real DB — test them with integration tests against a test database, not mocks.

### Example test pattern

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/tools/my-tool/logic'

describe('myFunction', () => {
  it('handles empty input', () => {
    expect(myFunction('').output).toBe('')
  })

  it('processes valid input', () => {
    expect(myFunction('hello').output).toBe('HELLO')
  })

  it('handles error case', () => {
    const r = myFunction('invalid###')
    expect(r.success).toBe(false)
    expect(r.error).toBeDefined()
  })
})
```

---

## 17. Deployment (Vercel)

### First deploy

```bash
npm install -g vercel
vercel
# Follow prompts: link to project, choose defaults
```

### Environment variables on Vercel

Set all variables from `.env` in:
**Vercel Dashboard → Project → Settings → Environment Variables**

Critical ones:
- `DATABASE_URL` — must be a hosted DB (Neon recommended for Vercel)
- `AUTH_SECRET` — same value as local `.env`
- `NEXTAUTH_URL` — set to `https://yourdomain.com` (NextAuth v5 reads `AUTH_URL` or derives from request)
- `NEXT_PUBLIC_APP_URL` — `https://yourdomain.com`
- All Stripe vars (live mode keys for production)

### Database for production

**Neon** is the recommended choice — serverless PostgreSQL, integrates directly with Vercel, free tier is generous.

1. Create project on neon.tech
2. Copy connection string
3. Run migrations: `DATABASE_URL=... npm run db:migrate`
4. Paste connection string into Vercel env vars

### Deployment checklist

- [ ] All env vars set in Vercel
- [ ] Database reachable from Vercel's servers
- [ ] `db:migrate` run against production DB (not `db:push`)
- [ ] Stripe webhook endpoint registered for production domain
- [ ] `AUTH_SECRET` is a fresh random value (not the dev one)
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain

### Custom domain

Vercel Dashboard → Project → Settings → Domains → Add domain

---

## 18. Known gaps and next priorities

### Must-do before scaling

| Gap | Location | Fix |
|---|---|---|
| No dark mode toggle | `src/app/layout.tsx` | Apply `.dark` class to `<html>` based on user preference / system setting |
| No email auth | `src/auth.config.ts` | Add `Resend` or `Nodemailer` email provider to NextAuth |
| In-memory search caps at ~500 tools | `src/platform/search/service.ts` | Replace with PostgreSQL `tsvector` FTS |
| No integration tests | `tests/` | Add a test DB + Vitest integration test suite for platform services |
| No rate limiting | `src/app/api/` | Add `@upstash/ratelimit` (Redis) on `/api/tools/[slug]/use` |

### Nice to have

- Admin panel (`/admin`) — user list, tool usage stats, manual credit adjustments
- Tool favorites / bookmarks per user
- Tool usage history on dashboard (data already in DB)
- Dark mode (CSS vars already wired, just needs class toggle)
- Email notifications on purchase receipts (Stripe sends these automatically if configured)
- Subscription billing (Stripe subscriptions instead of one-time packs)

### Architecture decisions to revisit at scale

- **Sessions**: JWT sessions can't be instantly revoked. If you need instant revocation (e.g. ban a user mid-session), switch to `strategy: 'database'` in `src/auth.ts`.
- **Search**: In-memory search loads all tool manifests on each request. Fine at 500 tools, expensive at 5,000. Move to PG FTS or Algolia.
- **Tool registration**: `src/tools/index.ts` is a manual list. At 100+ tools, consider auto-discovery via a build script that scans `src/tools/*/index.ts`.
