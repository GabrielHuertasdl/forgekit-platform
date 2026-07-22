import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { JsonFormatterTool } from './component'

const toolModule: ToolModule = {
  manifest,
  Component: JsonFormatterTool,
}

export default toolModule
