import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'base64-encoder',
  name: 'Base64 Encoder / Decoder',
  description: 'Encode and decode text to Base64 with full Unicode support.',
  longDescription:
    'Convert any text to Base64 encoding or decode Base64 back to readable text. Uses TextEncoder/TextDecoder for full Unicode and emoji support. Useful for encoding binary data, API credentials, and data URIs.',
  category: 'conversion',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['base64', 'encoder', 'decoder', 'encoding', 'conversion'],
  icon: 'Binary',
  keywords: [
    'base64 encoder',
    'base64 decoder',
    'base64 encode online',
    'base64 decode online',
    'text to base64',
    'base64 to text',
  ],
}
