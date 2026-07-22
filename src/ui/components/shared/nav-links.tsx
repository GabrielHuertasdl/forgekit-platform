'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { cn } from '@/lib/utils'

export interface NavLinkItem {
  href: Route
  label: string
}

interface Props {
  links: NavLinkItem[]
}

export function NavLinks({ links }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              isActive
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
