import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { CaseConverterTool } from './component'

export const caseConverterModule: ToolModule = {
  manifest,
  Component: CaseConverterTool,
}
