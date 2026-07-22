import type { ToolModule } from '@/tools/_registry'
import { manifest } from './manifest'
import { UrlEncoderTool } from './component'

const toolModule: ToolModule = {
  manifest,
  Component: UrlEncoderTool,
}

export default toolModule
