import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Format, minify, and validate JSON instantly.',
  longDescription:
    'Paste any JSON to format it with proper indentation, minify it for production, or validate it for syntax errors. Supports nested objects, arrays, and all standard JSON data types.',
  category: 'developer',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['json', 'formatter', 'minifier', 'validator', 'pretty print'],
  icon: 'Braces',
  keywords: [
    'json formatter',
    'json beautifier',
    'json minifier',
    'json validator',
    'pretty print json',
    'format json online',
  ],
}
