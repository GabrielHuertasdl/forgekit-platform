import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { PasswordGeneratorTool } from './component'

export const passwordGeneratorModule: ToolModule = {
  manifest,
  Component: PasswordGeneratorTool,
}
