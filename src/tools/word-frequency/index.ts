import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { WordFrequencyTool } from './component'

export const wordFrequencyModule: ToolModule = {
  manifest,
  Component: WordFrequencyTool,
}
