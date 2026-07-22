import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { toolRegistry } from '@/tools'

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
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = toolRegistry.get(slug)

  if (!tool || tool.manifest.status === 'deprecated') {
    notFound()
  }

  const { manifest, Component } = tool

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{manifest.name}</h1>
        <p className="text-muted-foreground mt-1">{manifest.description}</p>
      </header>

      <Component />
    </main>
  )
}
