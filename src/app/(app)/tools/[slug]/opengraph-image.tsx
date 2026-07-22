import { ImageResponse } from 'next/og'
import { toolRegistry } from '@/tools'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const manifest = toolRegistry.getManifest(slug)

  const title = manifest?.name ?? 'ForgeKit'
  const description = manifest?.description ?? 'A modular platform of high-quality micro-tools.'
  const category = manifest?.category ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          padding: '80px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#64748b', fontSize: '20px', fontFamily: 'sans-serif', fontWeight: 600 }}>
            ForgeKit
          </span>
          {category && (
            <>
              <span style={{ color: '#334155', fontSize: '20px' }}>·</span>
              <span style={{ color: '#475569', fontSize: '16px', textTransform: 'capitalize', fontFamily: 'sans-serif' }}>
                {category}
              </span>
            </>
          )}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 700,
              color: '#f8fafc',
              fontFamily: 'sans-serif',
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              fontFamily: 'sans-serif',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
