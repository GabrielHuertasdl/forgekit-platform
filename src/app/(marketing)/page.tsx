import Link from 'next/link'
import type { Metadata } from 'next'
import { searchTools } from '@/platform/search'
import { TOOL_CATEGORIES, type ToolCategory } from '@/tools/_registry'
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

  const allActive = toolRegistry.active()
  const categoriesWithTools = TOOL_CATEGORIES.filter((cat) =>
    allActive.some((m) => m.category === cat),
  )

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
            Fast, accurate tools for text, code, and data.
          </h1>
          <p className="text-muted-foreground mb-6 max-w-lg">
            Free utilities that run in your browser. No install, no account needed.
          </p>

          <form action="/" method="GET" className="flex gap-2 max-w-lg">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={'Search tools — try "password" or "JSON"…'}
              className="flex-1 h-11 px-4 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search tools"
              autoComplete="off"
            />
            <button
              type="submit"
              className="h-11 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
        </div>
      </section>

      {/* ── Category tabs ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : '/'}
              className={`shrink-0 text-sm px-4 py-3 border-b-2 transition-colors ${
                !category
                  ? 'border-foreground text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </Link>
            {categoriesWithTools.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${cat}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`shrink-0 text-sm px-4 py-3 border-b-2 transition-colors capitalize ${
                  category === cat
                    ? 'border-foreground text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tools area ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isSearching ? (
          <>
            {q && (
              <p className="text-sm text-muted-foreground mb-5">
                {tools.length === 0
                  ? `No results for "${q}"`
                  : `${tools.length} result${tools.length !== 1 ? 's' : ''} for "${q}"`}
              </p>
            )}
            {tools.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="flex flex-col gap-10">
            {categoriesWithTools.map((cat) => {
              const catTools = allActive.filter((m) => m.category === cat)
              return (
                <section key={cat}>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    {cat}
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
