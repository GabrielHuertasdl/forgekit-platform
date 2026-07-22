import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum Generator',
  description: 'Generate placeholder lorem ipsum text by paragraphs, sentences, or words.',
  longDescription:
    'Quickly produce placeholder copy for mockups, wireframes, and design templates. Choose between paragraphs, sentences, or individual words. Output starts with the classic "Lorem ipsum dolor sit amet" opening for authenticity.',
  category: 'productivity',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['lorem ipsum', 'placeholder', 'dummy text', 'filler text', 'design', 'mockup'],
  icon: 'AlignLeft',
  keywords: [
    'lorem ipsum generator',
    'placeholder text generator',
    'dummy text generator',
    'filler text online',
    'lorem ipsum online',
    'lorem ipsum paragraphs',
  ],
}
