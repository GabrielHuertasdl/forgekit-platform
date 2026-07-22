import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { Base64EncoderTool } from './component'

const toolModule: ToolModule = {
  manifest,
  Component: Base64EncoderTool,
}

export default toolModule
