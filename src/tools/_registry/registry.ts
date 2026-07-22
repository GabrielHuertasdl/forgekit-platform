import type { ToolManifest, ToolModule } from './types'

class ToolRegistry {
  private readonly tools = new Map<string, ToolModule>()

  register(module: ToolModule): void {
    if (this.tools.has(module.manifest.slug)) {
      throw new Error(`Tool slug "${module.manifest.slug}" is already registered. Slugs must be unique.`)
    }
    this.tools.set(module.manifest.slug, module)
  }

  get(slug: string): ToolModule | undefined {
    return this.tools.get(slug)
  }

  getManifest(slug: string): ToolManifest | undefined {
    return this.tools.get(slug)?.manifest
  }

  all(): ToolModule[] {
    return Array.from(this.tools.values())
  }

  allManifests(): ToolManifest[] {
    return this.all().map((t) => t.manifest)
  }

  byCategory(category: ToolManifest['category']): ToolManifest[] {
    return this.allManifests().filter((m) => m.category === category)
  }

  active(): ToolManifest[] {
    return this.allManifests().filter((m) => m.status === 'active' || m.status === 'beta')
  }

  has(slug: string): boolean {
    return this.tools.has(slug)
  }

  size(): number {
    return this.tools.size
  }
}

export const toolRegistry = new ToolRegistry()
