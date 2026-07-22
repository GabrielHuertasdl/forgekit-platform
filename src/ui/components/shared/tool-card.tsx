import Link from 'next/link'
import type { ToolManifest } from '@/tools/_registry'

interface Props {
  manifest: ToolManifest
}

export function ToolCard({ manifest }: Props) {
  return (
    <Link
      href={`/tools/${manifest.slug}`}
      className="flex flex-col gap-1 p-4 rounded-lg border border-border hover:bg-muted transition-colors h-full"
    >
      <p className="font-medium">{manifest.name}</p>
      <p className="text-sm text-muted-foreground flex-1">{manifest.description}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span className="capitalize">{manifest.category}</span>
        {manifest.creditsPerUse > 0 && (
          <span>· {manifest.creditsPerUse} credit{manifest.creditsPerUse !== 1 ? 's' : ''}</span>
        )}
        {manifest.status === 'beta' && (
          <span className="ml-auto rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
            beta
          </span>
        )}
      </div>
    </Link>
  )
}
