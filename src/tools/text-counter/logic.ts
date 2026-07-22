export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTimeMinutes: number
}

const WORDS_PER_MINUTE = 200

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim()

  if (!trimmed) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    }
  }

  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = trimmed.split(/\s+/).filter(Boolean).length
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  const readingTimeMinutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return { characters, charactersNoSpaces, words, sentences, paragraphs, readingTimeMinutes }
}
