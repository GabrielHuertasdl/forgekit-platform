import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { TextCounterTool } from './component'

export const textCounterModule: ToolModule = {
  manifest,
  Component: TextCounterTool,
}
