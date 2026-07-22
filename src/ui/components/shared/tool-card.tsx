import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ToolManifest } from '@/tools/_registry'
import { CATEGORY_COLORS } from '@/tools/_registry'
import { cn } from '@/lib/utils'

interface Props {
  manifest: ToolManifest
}

export function ToolCard({ manifest }: Props) {
  const colors = CATEGORY_COLORS[manifest.category]
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[manifest.icon]

  return (
    <Link
      href={`/tools/${manifest.slug}`}
      className="flex flex-col gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm bg-card transition-all duration-150 h-full group"
    >
      {/* Icon + name row */}
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg shrink-0', colors.bg)}>
          {IconComponent && (
            <IconComponent className={cn('w-4 h-4', colors.icon)} aria-hidden />
          )}
        </div>
        <p className="font-semibold text-sm leading-tight mt-1 group-hover:text-primary transition-colors">
          {manifest.name}
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
        {manifest.description}
      </p>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', colors.bg, colors.text)}>
          {manifest.category}
        </span>
        {manifest.creditsPerUse === 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
            Free
          </span>
        )}
        {manifest.creditsPerUse > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {manifest.creditsPerUse} credit{manifest.creditsPerUse !== 1 ? 's' : ''}
          </span>
        )}
        {manifest.status === 'beta' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
            beta
          </span>
        )}
      </div>
    </Link>
  )
}
