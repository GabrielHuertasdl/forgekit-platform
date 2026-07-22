import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/platform/auth'
import { deductCredits } from '@/platform/credits'
import { trackToolUsage } from '@/platform/analytics'
import { toolRegistry } from '@/tools'

interface Context {
  params: Promise<{ slug: string }>
}

export async function POST(_req: NextRequest, { params }: Context) {
  const { slug } = await params

  const manifest = toolRegistry.getManifest(slug)
  if (!manifest || manifest.status === 'deprecated') {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  // Free tools: track usage (best-effort, non-blocking), no auth required.
  if (manifest.creditsPerUse === 0) {
    const session = await auth()
    void trackToolUsage(session?.user?.id ?? null, slug, 0)
    return NextResponse.json({ success: true })
  }

  // Paid tools: require auth, deduct credits, track.
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await deductCredits(session.user.id, manifest.creditsPerUse, slug)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Insufficient credits', creditsNeeded: manifest.creditsPerUse },
      { status: 402 },
    )
  }

  void trackToolUsage(session.user.id, slug, manifest.creditsPerUse)

  return NextResponse.json({ success: true, newBalance: result.newBalance })
}
