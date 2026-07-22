import Link from 'next/link'
import type { Metadata } from 'next'
import { searchTools } from '@/platform/search'
import { TOOL_CATEGORIES } from '@/tools/_registry'
import type { ToolCategory } from '@/tools/_registry'
import { ToolCard } from '@/ui/components/shared/tool-card'

export const metadata: Metadata = {
  title: 'ForgeKit — Modular Tools Platform',
  description: 'A modular platform of high-quality micro-tools for developers, writers, and creators.',
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

  const tools = searchTools(q, { category, limit: 50 })

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-1">ForgeKit</h1>
        <p className="text-muted-foreground">
          A modular platform of high-quality micro-tools.
        </p>
      </header>

      {/* Search — zero-JS form, server-rendered results */}
      <form action="/" method="GET" className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search tools…"
          className="flex-1 h-10 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search tools"
        />
        <button
          type="submit"
          className="h-10 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
        {(q || category) && (
          <Link
            href="/"
            className="h-10 px-4 text-sm font-medium border border-border rounded-md flex items-center hover:bg-muted transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={q ? `/?q=${encodeURIComponent(q)}` : '/'}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !category
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          All
        </Link>
        {TOOL_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/?category=${cat}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
              category === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Results count when searching */}
      {q && (
        <p className="text-sm text-muted-foreground mb-4">
          {tools.length === 0
            ? `No results for "${q}"`
            : `${tools.length} result${tools.length !== 1 ? 's' : ''} for "${q}"`}
        </p>
      )}

      {tools.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <ToolCard manifest={tool} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {q ? `No tools match "${q}".` : 'No tools available yet.'}
        </p>
      )}
    </main>
  )
}
