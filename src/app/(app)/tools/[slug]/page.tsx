import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toolRegistry } from '@/tools'
import type { ToolManifest } from '@/tools/_registry'
import { CATEGORY_COLORS } from '@/tools/_registry'
import { env } from '@/lib/env'
import { auth } from '@/platform/auth'
import { cn } from '@/lib/utils'
import { ToolCard } from '@/ui/components/shared/tool-card'

let getToolUsageCount: ((slug: string) => Promise<number>) | undefined

try {
  // Analytics import may fail at build time if DB is unavailable
  const analytics = await import('@/platform/analytics')
  getToolUsageCount = analytics.getToolUsageCount
} catch {
  // Silently degrade — usage count is non-critical
}

export const dynamicParams = false

export function generateStaticParams() {
  return toolRegistry.allManifests().map((m) => ({ slug: m.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const manifest = toolRegistry.getManifest(slug)
  if (!manifest) return {}

  return {
    title: `${manifest.name} — ForgeKit`,
    description: manifest.description,
    keywords: manifest.keywords,
    openGraph: {
      title: `${manifest.name} — ForgeKit`,
      description: manifest.description,
      type: 'website',
      url: `/tools/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${manifest.name} — ForgeKit`,
      description: manifest.description,
    },
  }
}

function buildJsonLd(manifest: ToolManifest) {
  const appUrl = env.NEXT_PUBLIC_APP_URL

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: manifest.name,
    description: manifest.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    url: `${appUrl}/tools/${manifest.slug}`,
    keywords: manifest.keywords.join(', '),
    creator: {
      '@type': 'Organization',
      name: 'ForgeKit',
      url: appUrl,
    },
    ...(manifest.creditsPerUse === 0 && {
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }),
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = toolRegistry.get(slug)

  if (!tool || tool.manifest.status === 'deprecated') {
    notFound()
  }

  const { manifest, Component } = tool
  const jsonLd = buildJsonLd(manifest)
  const colors = CATEGORY_COLORS[manifest.category]
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[manifest.icon]

  const [session, usageCount] = await Promise.all([
    auth(),
    getToolUsageCount ? getToolUsageCount(slug).catch(() => 0) : Promise.resolve(0),
  ])

  // Related tools — same category, exclude self, max 3
  const relatedManifests = toolRegistry
    .active()
    .filter((m) => m.category === manifest.category && m.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 capitalize">
            <Link href="/" className="hover:text-foreground transition-colors">Tools</Link>
            <span>/</span>
            <Link
              href={`/?category=${manifest.category}` as `/?category=${string}`}
              className="hover:text-foreground transition-colors"
            >
              {manifest.category}
            </Link>
          </nav>

          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-3">
            {IconComponent && (
              <div className={cn('p-3 rounded-xl shrink-0', colors.bg)}>
                <IconComponent className={cn('w-6 h-6', colors.icon)} aria-hidden />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{manifest.name}</h1>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {manifest.description}
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-2">
            {manifest.creditsPerUse === 0 ? (
              <>
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">
                  Free
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  No account needed
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  Works in browser
                </span>
              </>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                {manifest.creditsPerUse} credit{manifest.creditsPerUse !== 1 ? 's' : ''} per use
              </span>
            )}
            {manifest.status === 'beta' && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                beta
              </span>
            )}
            {usageCount > 10 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                Used {usageCount.toLocaleString()}+ times
              </span>
            )}
          </div>
        </header>

        {/* Tool component */}
        <div className="mb-12">
          <Component userId={session?.user?.id} />
        </div>

        {/* Related tools */}
        {relatedManifests.length > 0 && (
          <section className="border-t border-border pt-8 mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Related tools
            </h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {relatedManifests.map((m) => (
                <li key={m.slug}>
                  <ToolCard manifest={m} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* About section */}
        {manifest.longDescription && (
          <section className="border-t border-border pt-8">
            <h2 className="text-base font-semibold mb-3">About {manifest.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">{manifest.longDescription}</p>
            {manifest.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {manifest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}
