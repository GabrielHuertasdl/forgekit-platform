import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { LoremIpsumGeneratorTool } from './component'

export const loremIpsumGeneratorModule: ToolModule = {
  manifest,
  Component: LoremIpsumGeneratorTool,
}
