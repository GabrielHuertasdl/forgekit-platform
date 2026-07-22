import Link from 'next/link'
import { toolRegistry } from '@/tools'

export default function HomePage() {
  const tools = toolRegistry.active()

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">ForgeKit</h1>
        <p className="text-muted-foreground text-lg">
          A modular platform of high-quality micro-tools.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Tools ({tools.length})</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <p className="font-medium">{tool.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
