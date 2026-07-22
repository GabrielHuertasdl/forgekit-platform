export interface WordFrequencyEntry {
  word: string
  count: number
  percentage: number
}

export interface WordFrequencyResult {
  entries: WordFrequencyEntry[]
  totalWords: number
  uniqueWords: number
}

export function analyzeWordFrequency(text: string): WordFrequencyResult {
  if (!text.trim()) {
    return { entries: [], totalWords: 0, uniqueWords: 0 }
  }

  const tokens = text.toLowerCase().match(/\b[a-z']+\b/g) ?? []
  const freq = new Map<string, number>()

  for (const word of tokens) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }

  const totalWords = tokens.length

  const entries: WordFrequencyEntry[] = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / totalWords) * 1000) / 10,
    }))

  return {
    entries,
    totalWords,
    uniqueWords: freq.size,
  }
}
