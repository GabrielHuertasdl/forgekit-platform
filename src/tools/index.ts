import { toolRegistry } from './_registry'
import { textCounterModule } from './text-counter'
import jsonFormatterModule from './json-formatter'
import base64EncoderModule from './base64-encoder'
import urlEncoderModule from './url-encoder'

// Register all tools here. Import order does not matter — slugs must be unique.
toolRegistry.register(textCounterModule)
toolRegistry.register(jsonFormatterModule)
toolRegistry.register(base64EncoderModule)
toolRegistry.register(urlEncoderModule)

export { toolRegistry }
