import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ToolManifest } from '@/tools/_registry'

interface Props {
  manifest: ToolManifest
}

export function ToolCard({ manifest }: Props) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[manifest.icon]

  return (
    <Link
      href={`/tools/${manifest.slug}`}
      className="flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 bg-card transition-all duration-150 h-full group"
    >
      <div className="flex items-start gap-2.5">
        {IconComponent && (
          <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5 transition-colors" aria-hidden />
        )}
        <p className="font-medium text-sm leading-tight">
          {manifest.name}
        </p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {manifest.description}
      </p>
    </Link>
  )
}
