import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'word-frequency',
  name: 'Word Frequency Counter',
  description: 'Count word occurrences in any text, sorted by frequency.',
  longDescription:
    'Paste any text to see how often each word appears, sorted from most to least frequent. Ideal for SEO keyword density analysis, academic writing, content optimization, and spotting overused words.',
  category: 'text',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['word frequency', 'word count', 'keyword density', 'text analysis', 'seo'],
  icon: 'BarChart3',
  keywords: [
    'word frequency counter',
    'word occurrence counter',
    'keyword frequency analyzer',
    'word frequency analysis online',
    'text frequency counter',
    'keyword density checker',
  ],
}
