import Link from 'next/link'
import type { Metadata } from 'next'
import { searchTools } from '@/platform/search'
import { TOOL_CATEGORIES, CATEGORY_EMOJIS, type ToolCategory } from '@/tools/_registry'
import { toolRegistry } from '@/tools'
import { ToolCard } from '@/ui/components/shared/tool-card'

export const metadata: Metadata = {
  title: 'ForgeKit — Free Online Tools',
  description: 'Every tool you actually need. Free, instant, no install required. Word counters, password generators, JSON formatters, Base64 encoders, and more.',
  openGraph: {
    title: 'ForgeKit — Free Online Tools',
    description: 'Every tool you actually need. Free, instant, no install required.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ForgeKit — Free Online Tools',
    description: 'Every tool you actually need. Free, instant, no install required.',
  },
}

const POPULAR_SLUGS = [
  'password-generator',
  'json-formatter',
  'case-converter',
  'text-counter',
  'base64-encoder',
  'lorem-ipsum-generator',
]

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { q = '', category: rawCategory } = await searchParams

  const category =
    rawCategory && (TOOL_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as ToolCategory)
      : undefined

  const tools = searchTools(q, { category, limit: 100 })
  const isSearching = !!(q || category)

  // For grouped view — only show categories with tools
  const allActive = toolRegistry.active()
  const categoriesWithTools = TOOL_CATEGORIES.filter((cat) =>
    allActive.some((m) => m.category === cat),
  )

  // Popular quick-access chips
  const popularTools = POPULAR_SLUGS.flatMap((slug) => {
    const m = toolRegistry.getManifest(slug)
    return m ? [m] : []
  })

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            The tools you need,<br className="hidden sm:block" /> right in your browser.
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Free, instant utilities for text, code, security, and more — no install, no account required.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium border border-green-200">
              ✓ Free tools available
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full font-medium border border-border">
              ✓ No install required
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full font-medium border border-border">
              ✓ Works in any browser
            </span>
          </div>

          {/* Search */}
          <form action="/" method="GET" className="flex gap-2 max-w-lg mx-auto mb-6">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={'Search tools — try "password" or "JSON"…'}
              className="flex-1 h-11 px-4 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
              aria-label="Search tools"
              autoComplete="off"
            />
            <button
              type="submit"
              className="h-11 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Search
            </button>
            {isSearching && (
              <Link
                href="/"
                className="h-11 px-4 text-sm font-medium border border-border rounded-lg flex items-center hover:bg-muted transition-colors"
              >
                Clear
              </Link>
            )}
          </form>

          {/* Popular chips */}
          {!isSearching && popularTools.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {popularTools.map((m) => (
                <Link
                  key={m.slug}
                  href={`/tools/${m.slug}`}
                  className="text-xs px-3 py-1 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-colors"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Category filter pills ─────────────────────────────────────── */}
      <div className="border-b border-border bg-background sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : '/'}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                !category
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All tools
            </Link>
            {categoriesWithTools.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${cat}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors flex items-center gap-1.5 ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tools area ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isSearching ? (
          /* Search results: flat grid */
          <>
            {q && (
              <p className="text-sm text-muted-foreground mb-5">
                {tools.length === 0
                  ? `No results for "${q}"`
                  : `${tools.length} result${tools.length !== 1 ? 's' : ''} for "${q}"`}
              </p>
            )}
            {tools.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <ToolCard manifest={tool} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">No tools match &ldquo;{q}&rdquo;.</p>
                <Link href="/" className="text-sm text-primary hover:underline">
                  Browse all tools →
                </Link>
              </div>
            )}
          </>
        ) : (
          /* Browse: category sections */
          <div className="flex flex-col gap-10">
            {categoriesWithTools.map((cat) => {
              const catTools = allActive.filter((m) => m.category === cat)
              return (
                <section key={cat}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>{CATEGORY_EMOJIS[cat]}</span>
                    <span>{cat}</span>
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {catTools.map((tool) => (
                      <li key={tool.slug}>
                        <ToolCard manifest={tool} />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
