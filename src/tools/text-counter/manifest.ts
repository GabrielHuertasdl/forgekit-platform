import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'text-counter',
  name: 'Text Counter',
  description: 'Count words, characters, sentences, and reading time in any text.',
  longDescription:
    'Paste any text to instantly see word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time. Useful for writers, students, and content creators.',
  category: 'text',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['word count', 'character count', 'reading time', 'text analysis'],
  icon: 'FileText',
  keywords: [
    'word counter',
    'character counter',
    'text analyzer',
    'reading time calculator',
    'sentence counter',
    'online word count',
  ],
}
