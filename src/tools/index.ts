import { toolRegistry } from './_registry'
import { textCounterModule } from './text-counter'
import jsonFormatterModule from './json-formatter'
import base64EncoderModule from './base64-encoder'
import urlEncoderModule from './url-encoder'
import { passwordGeneratorModule } from './password-generator'
import { caseConverterModule } from './case-converter'
import { loremIpsumGeneratorModule } from './lorem-ipsum-generator'
import { wordFrequencyModule } from './word-frequency'

// Register all tools. Import order doesn't matter — slugs must be unique.
toolRegistry.register(textCounterModule)
toolRegistry.register(jsonFormatterModule)
toolRegistry.register(base64EncoderModule)
toolRegistry.register(urlEncoderModule)
toolRegistry.register(passwordGeneratorModule)
toolRegistry.register(caseConverterModule)
toolRegistry.register(loremIpsumGeneratorModule)
toolRegistry.register(wordFrequencyModule)

export { toolRegistry }
