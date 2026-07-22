import { toolRegistry } from './_registry'
import { textCounterModule } from './text-counter'

// Register all tools here. Import order does not matter — slugs must be unique.
toolRegistry.register(textCounterModule)

export { toolRegistry }
