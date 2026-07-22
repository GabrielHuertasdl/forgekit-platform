import type { ComponentType } from 'react'

export const TOOL_CATEGORIES = [
  'text',
  'image',
  'code',
  'data',
  'productivity',
  'developer',
  'ai',
  'conversion',
  'security',
  'math',
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export type ToolStateMode = 'stateless' | 'workspaceAware'

export type ToolStatus = 'active' | 'beta' | 'deprecated' | 'coming_soon'

export interface ToolManifest {
  /** Permanent kebab-case identifier. Never change after first release — it is the URL slug and DB key. */
  slug: string
  name: string
  description: string
  longDescription: string
  category: ToolCategory
  stateMode: ToolStateMode
  status: ToolStatus
  version: string
  /** Credits deducted per use. 0 = free. */
  creditsPerUse: number
  isPremium: boolean
  tags: string[]
  /** Lucide icon name. @see https://lucide.dev/icons/ */
  icon: string
  /** SEO / AEO keywords. */
  keywords: string[]
}

export interface ToolProps {
  /** Authenticated user id, undefined if unauthenticated (free tool). */
  userId?: string
}

export interface ToolModule {
  manifest: ToolManifest
  Component: ComponentType<ToolProps>
}

export const CATEGORY_COLORS: Record<ToolCategory, { bg: string; text: string; icon: string }> = {
  text:         { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: 'text-blue-600' },
  developer:    { bg: 'bg-violet-100', text: 'text-violet-700', icon: 'text-violet-600' },
  security:     { bg: 'bg-red-100',    text: 'text-red-700',    icon: 'text-red-600' },
  conversion:   { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: 'text-amber-600' },
  ai:           { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-600' },
  data:         { bg: 'bg-green-100',  text: 'text-green-700',  icon: 'text-green-600' },
  math:         { bg: 'bg-teal-100',   text: 'text-teal-700',   icon: 'text-teal-600' },
  image:        { bg: 'bg-pink-100',   text: 'text-pink-700',   icon: 'text-pink-600' },
  productivity: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-600' },
  code:         { bg: 'bg-slate-100',  text: 'text-slate-700',  icon: 'text-slate-600' },
}

export const CATEGORY_EMOJIS: Record<ToolCategory, string> = {
  text: '📝',
  developer: '⚙️',
  security: '🔒',
  conversion: '🔄',
  ai: '🤖',
  data: '📊',
  math: '🧮',
  image: '🖼️',
  productivity: '⚡',
  code: '💻',
}
