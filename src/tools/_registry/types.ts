import type { ComponentType } from 'react'

export type ToolCategory =
  | 'text'
  | 'image'
  | 'code'
  | 'data'
  | 'productivity'
  | 'developer'
  | 'ai'
  | 'conversion'
  | 'security'
  | 'math'

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
