import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { toolRegistry } from '@/tools'
import type { ToolManifest } from '@/tools/_registry'
import { env } from '@/lib/env'

/**
 * Only slugs returned by generateStaticParams are valid routes.
 * Next.js 404s any other slug at the framework level, before the page runs.
 * Pages still render dynamically (SSR) because the (app) layout calls auth().
 */
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
    title: manifest.name,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-3 capitalize">
            <span>{manifest.category}</span>
            {manifest.creditsPerUse > 0 && (
              <>
                <span>·</span>
                <span>
                  {manifest.creditsPerUse} credit{manifest.creditsPerUse !== 1 ? 's' : ''} per use
                </span>
              </>
            )}
            {manifest.status === 'beta' && (
              <>
                <span>·</span>
                <span className="text-amber-600 font-medium">beta</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{manifest.name}</h1>
          <p className="text-muted-foreground mt-2 text-base leading-relaxed">
            {manifest.description}
          </p>
        </header>

        <Component />

        {manifest.longDescription && (
          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-lg font-semibold mb-3">About {manifest.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{manifest.longDescription}</p>
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
