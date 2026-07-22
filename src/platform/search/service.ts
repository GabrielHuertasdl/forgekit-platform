import type { ToolManifest, ToolCategory } from '@/tools/_registry'
import { toolRegistry } from '@/tools'

export interface SearchOptions {
  category?: ToolCategory
  limit?: number
}

export function searchTools(query: string, options?: SearchOptions): ToolManifest[] {
  const q = query.toLowerCase().trim()
  const { category, limit = 20 } = options ?? {}

  let manifests = toolRegistry.active()

  if (category) {
    manifests = manifests.filter((m) => m.category === category)
  }

  if (!q) return manifests.slice(0, limit)

  const scored = manifests
    .map((m) => {
      let score = 0
      const name = m.name.toLowerCase()

      if (name.startsWith(q)) score += 15
      else if (name.includes(q)) score += 10

      if (m.description.toLowerCase().includes(q)) score += 3
      if (m.tags.some((t) => t.toLowerCase().includes(q))) score += 4
      if (m.keywords.some((k) => k.toLowerCase().includes(q))) score += 2

      return { manifest: m, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.manifest)

  return scored
}
