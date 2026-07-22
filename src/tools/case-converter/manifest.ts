import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'case-converter',
  name: 'Case Converter',
  description: 'Convert text between UPPER, lower, Title, Sentence, camelCase, kebab-case, and snake_case.',
  longDescription:
    'Instantly transform any text into seven common case formats. Perfect for programming (camelCase, snake_case), URLs (kebab-case), document headings (Title Case), and more. Paste your text, click a format — done.',
  category: 'text',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['case', 'text', 'camel case', 'snake case', 'kebab case', 'title case', 'converter'],
  icon: 'Type',
  keywords: [
    'case converter',
    'text case converter',
    'camelcase converter',
    'snake case converter',
    'kebab case converter',
    'title case converter online',
    'uppercase lowercase converter',
  ],
}
