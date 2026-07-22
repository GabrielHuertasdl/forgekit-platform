export type LoremType = 'paragraphs' | 'sentences' | 'words'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'est', 'laborum', 'perspiciatis', 'unde',
]

const OPENING =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

function wordAt(offset: number): string {
  return LOREM_WORDS[offset % LOREM_WORDS.length]!
}

function buildSentence(offset: number): string {
  const wordCount = 8 + (offset % 7)
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(wordAt(offset + i))
  }
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function buildParagraph(offset: number): string {
  const sentenceCount = 3 + (offset % 3)
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(buildSentence(offset + i * 15))
  }
  return sentences.join(' ')
}

export function generateLorem(type: LoremType, count: number): string {
  const n = Math.min(Math.max(Math.floor(count), 1), 100)

  switch (type) {
    case 'paragraphs': {
      const parts: string[] = [OPENING]
      for (let i = 1; i < n; i++) {
        parts.push(buildParagraph(i * 20))
      }
      return parts.join('\n\n')
    }

    case 'sentences': {
      const sentences: string[] = [OPENING]
      for (let i = 1; i < n; i++) {
        sentences.push(buildSentence(i * 15))
      }
      return sentences.join(' ')
    }

    case 'words': {
      const words: string[] = []
      for (let i = 0; i < n; i++) {
        words.push(wordAt(i))
      }
      const result = words.join(' ')
      return result.charAt(0).toUpperCase() + result.slice(1)
    }
  }
}
