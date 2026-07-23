import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toolRegistry } from '@/tools'
import type { ToolManifest } from '@/tools/_registry'
import { env } from '@/lib/env'
import { auth } from '@/platform/auth'
import { ToolCard } from '@/ui/components/shared/tool-card'

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
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[manifest.icon]

  const session = await auth()

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
          <div className="flex items-start gap-3 mb-2">
            {IconComponent && (
              <IconComponent className="w-5 h-5 text-muted-foreground shrink-0 mt-1" aria-hidden />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{manifest.name}</h1>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {manifest.description}
              </p>
            </div>
          </div>

          {/* Metadata line */}
          <p className="text-xs text-muted-foreground capitalize ml-8">
            {manifest.category}
            {manifest.creditsPerUse === 0
              ? ' · Free'
              : ` · ${manifest.creditsPerUse} credit${manifest.creditsPerUse !== 1 ? 's' : ''} per use`}
            {manifest.status === 'beta' ? ' · Beta' : ''}
          </p>
        </header>

        {/* Tool component */}
        <div className="mb-12">
          <Component userId={session?.user?.id} />
        </div>

        {/* Related tools */}
        {relatedManifests.length > 0 && (
          <section className="border-t border-border pt-8 mb-8">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
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
