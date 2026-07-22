import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/platform/auth'
import { deductCredits } from '@/platform/credits'
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

  // Free tools — no auth or credit check required.
  if (manifest.creditsPerUse === 0) {
    return NextResponse.json({ success: true })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await deductCredits(session.user.id, manifest.creditsPerUse, slug)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        creditsNeeded: manifest.creditsPerUse,
      },
      { status: 402 },
    )
  }

  return NextResponse.json({ success: true, newBalance: result.newBalance })
}
