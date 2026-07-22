import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'url-encoder',
  name: 'URL Encoder / Decoder',
  description: 'Encode and decode URLs and query string parameters.',
  longDescription:
    'Percent-encode special characters in URLs or decode percent-encoded strings back to readable text. Uses encodeURIComponent and decodeURIComponent for spec-compliant results. Essential for building query strings, handling redirects, and debugging URL issues.',
  category: 'developer',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['url', 'encoder', 'decoder', 'percent encoding', 'uri'],
  icon: 'Link',
  keywords: [
    'url encoder',
    'url decoder',
    'percent encode',
    'urlencode online',
    'encode url online',
    'decode url online',
  ],
}
