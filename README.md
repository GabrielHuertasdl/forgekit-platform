# ForgeKit

**A modular micro-tools platform: one Next.js codebase with shared auth, Stripe credit billing, analytics and SEO, where each new tool is a self-contained plug-in module.**

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-7C3AED?logo=auth0&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-billing-635BFF?logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-81_tests-6E9F18?logo=vitest&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Overview

Instead of building and hosting dozens of separate single-purpose apps, ForgeKit lets you write a tool once (a manifest, a pure logic module, a React component) and drop it into the platform. Every registered tool automatically gets:

- A URL at `/tools/[slug]`, statically generated
- Optional auth gating and optional per-use credit billing
- Usage analytics
- SEO metadata, JSON-LD (`SoftwareApplication`) schema and a dynamic Open Graph image
- A listing on the home page, in the sitemap and in the search API

The platform layer (`src/platform/*`) is strictly separated from tool code (`src/tools/*`), so adding a tool never touches billing, auth or analytics code.

### Tools currently registered

| Slug | Name | Category | Credits |
|---|---|---|---|
| `text-counter` | Text Counter | text | 0 (free) |
| `case-converter` | Case Converter | text | 0 (free) |
| `word-frequency` | Word Frequency Counter | text | 0 (free) |
| `json-formatter` | JSON Formatter | developer | 0 (free) |
| `url-encoder` | URL Encoder / Decoder | developer | 0 (free) |
| `base64-encoder` | Base64 Encoder / Decoder | conversion | 0 (free) |
| `password-generator` | Password Generator | security | 0 (free) |
| `lorem-ipsum-generator` | Lorem Ipsum Generator | productivity | 0 (free) |

Any tool becomes paid by setting `creditsPerUse > 0` in its manifest.

## Key features

- **Plug-in tool registry** — typed `ToolManifest` / `ToolModule` contracts and a `ToolRegistry`; one line in `src/tools/index.ts` registers a tool.
- **Credit wallet with Stripe** — one-time credit packs via Stripe Checkout; webhook signature verification and idempotency (`stripe_events`) so retries never double-credit.
- **Atomic credit deduction** — `UPDATE ... WHERE credits_balance >= N`, with a full `credit_transactions` ledger; HTTP 402 on insufficient credits.
- **Edge-safe auth** — Auth.js v5 split into an Edge-compatible config (middleware route protection) and a Node config with the Drizzle adapter; Google OAuth, JWT sessions.
- **SEO / AEO built in** — per-tool metadata, keywords, JSON-LD, 1200×630 OG images via `next/og`, dynamic `sitemap.ts` and `robots.ts`.
- **Usage analytics** — fire-and-forget `tool_usage_events` tracking for anonymous and signed-in users, surfaced on the dashboard.
- **In-memory search** — weighted scoring over name, tags, description and keywords, exposed as a server function and a REST endpoint.
- **Typed configuration** — environment validated with Zod; TypeScript strict with `noUncheckedIndexedAccess`.

## Architecture

```mermaid
flowchart LR
    U[Browser] --> MW["Next.js middleware<br/>(Edge auth check)"]
    MW --> APP["Next.js 15 App Router<br/>pages + API routes"]
    APP --> REG["Tool registry<br/>src/tools/*"]
    APP --> PLAT["Platform services<br/>auth · credits · billing · analytics · search"]
    PLAT --> DB[("PostgreSQL<br/>Drizzle ORM")]
    PLAT -->|Checkout session| STRIPE[Stripe]
    STRIPE -->|checkout.session.completed webhook| APP
    MW -.-> GOOGLE[Google OAuth]
    APP -.->|deploy| HOST["Vercel + Neon<br/>(or any Node host + Postgres)"]
```

Request flow for a paid tool: the tool component calls `POST /api/tools/[slug]/use` → the server reads `creditsPerUse` from the manifest → credits are deducted atomically and recorded in the ledger → an analytics event is emitted.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Server components, SSR/SSG, file-based routing |
| Language | TypeScript strict | `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` |
| Database | PostgreSQL + Drizzle ORM (`postgres.js`) | Type-safe queries, atomic transactions, migrations |
| Auth | NextAuth.js (Auth.js) v5 + DrizzleAdapter | Google OAuth out of the box, JWT sessions |
| Styling | Tailwind CSS v4 + CSS variables | Theme-aware, no config file |
| Components | shadcn/ui pattern (Radix primitives), Lucide icons | Accessible, unstyled-first |
| Billing | Stripe | Credit pack purchases, webhook idempotency |
| Validation | Zod | Typed env validation |
| Testing | Vitest | Fast, ESM-native, `@/*` alias support |
| DB migrations | Drizzle Kit | SQL migration files tracked in git |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A PostgreSQL database (local Docker, Neon or Supabase)
- Optional: Google OAuth credentials, Stripe test keys and the Stripe CLI

### Quick start

```bash
git clone <this-repo> forgekit && cd forgekit
./start.sh
```

`start.sh` creates `.env` from `.env.example`, generates `AUTH_SECRET`, prompts for `DATABASE_URL`, runs `npm install` and `db:push`, optionally seeds a dev user (`dev@forgekit.local`, 500 credits) and starts the dev server.

### Manual setup

```bash
cp .env.example .env          # fill in DATABASE_URL and AUTH_SECRET at minimum
npm install
npm run db:push               # or: npm run db:migrate
npm run db:seed               # optional dev user
npm run dev                   # http://localhost:3000
```

A local database with Docker:

```bash
docker run -d --name forgekit-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=forgekit -p 5432:5432 postgres:16
# DATABASE_URL=postgresql://postgres:secret@localhost:5432/forgekit
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest unit tests |
| `npm run db:generate` | Generate a SQL migration from schema changes |
| `npm run db:migrate` / `npm run db:push` | Apply migrations / push schema (dev) |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Seed the dev user |

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for JWT signing (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | For OAuth | Google OAuth client |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL of the app |
| `STRIPE_SECRET_KEY` | For billing | Stripe secret key (`sk_test_...` in dev) |
| `STRIPE_WEBHOOK_SECRET` | For billing | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe publishable key |
| `STRIPE_PRICE_STARTER` / `_PRO` / `_POWER` | Optional | Stripe Price IDs for the 100 / 500 / 2000-credit packs |

## Project structure

```
forgekit/
├── src/
│   ├── app/                 # App Router: (marketing), (auth), (app) route groups + api/
│   │   └── api/             # auth, billing/checkout, credits/balance, tools/[slug]/use, tools/search, webhooks/stripe
│   ├── platform/            # Shared services: auth, billing, credits, analytics, search
│   ├── tools/               # _registry/ + one folder per tool (manifest, logic, component, index)
│   ├── db/                  # Drizzle client, schema (users, billing, analytics), seed
│   ├── ui/components/       # UI primitives and shared components
│   ├── lib/                 # env validation (Zod), utils
│   ├── auth.config.ts       # Edge-compatible auth config
│   ├── auth.ts              # Full auth with DrizzleAdapter
│   └── middleware.ts        # Route protection
├── drizzle/                 # SQL migrations (tracked)
├── tests/tools/             # Unit tests per tool (logic.ts)
├── start.sh                 # First-run setup script
└── .env.example
```

---

# Developer guide

## Adding a new tool

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

## Tool manifest reference

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

## Credits and billing system

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

## Monetization options

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

## Stripe setup (step by step)

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

## Database schema

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

## API endpoints

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

## Auth architecture

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
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/billing']
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

## Search system

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

## SEO / AEO system

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

## Analytics

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

## Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode for development
```

Tests live in `tests/tools/`. Each tool's `logic.ts` file has a corresponding test file.

### Current test coverage

| File | Tests |
|---|---|
| `tests/tools/password-generator.test.ts` | 13 |
| `tests/tools/text-counter.test.ts` | 11 |
| `tests/tools/json-formatter.test.ts` | 11 |
| `tests/tools/case-converter.test.ts` | 11 |
| `tests/tools/base64-encoder.test.ts` | 9 |
| `tests/tools/url-encoder.test.ts` | 9 |
| `tests/tools/word-frequency.test.ts` | 9 |
| `tests/tools/lorem-ipsum-generator.test.ts` | 8 |
| **Total** | **81** |

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

## Deployment (Vercel)

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

## Known gaps and next priorities

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

---

## License

[MIT](LICENSE) © 2026 Gabriel Huertas
