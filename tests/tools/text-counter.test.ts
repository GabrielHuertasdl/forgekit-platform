import { describe, it, expect } from 'vitest'
import { analyzeText } from '@/tools/text-counter/logic'

describe('analyzeText', () => {
  it('returns zeros for empty string', () => {
    expect(analyzeText('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    })
  })

  it('returns zeros for whitespace-only string', () => {
    expect(analyzeText('   \n   ')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    })
  })

  it('counts words', () => {
    expect(analyzeText('Hello world foo bar').words).toBe(4)
  })

  it('counts characters including spaces', () => {
    expect(analyzeText('Hello world').characters).toBe(11)
  })

  it('counts characters without spaces', () => {
    expect(analyzeText('Hello world').charactersNoSpaces).toBe(10)
  })

  it('counts sentences terminated by . ! ?', () => {
    expect(analyzeText('Hello. World! How are you?').sentences).toBe(3)
  })

  it('counts paragraphs separated by blank lines', () => {
    expect(analyzeText('First paragraph.\n\nSecond paragraph.').paragraphs).toBe(2)
  })

  it('single paragraph has count of 1', () => {
    expect(analyzeText('One paragraph here.').paragraphs).toBe(1)
  })

  it('minimum reading time is 1 minute', () => {
    expect(analyzeText('Hello world.').readingTimeMinutes).toBe(1)
  })

  it('calculates reading time correctly at 200 wpm', () => {
    const fourHundredWords = Array(400).fill('word').join(' ')
    expect(analyzeText(fourHundredWords).readingTimeMinutes).toBe(2)
  })

  it('counts exact word boundaries', () => {
    expect(analyzeText('  spaced   out   words  ').words).toBe(3)
  })
})
