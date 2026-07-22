import { describe, it, expect } from 'vitest'
import { analyzeWordFrequency } from '@/tools/word-frequency/logic'

describe('analyzeWordFrequency', () => {
  it('empty string returns zero counts', () => {
    const r = analyzeWordFrequency('')
    expect(r.entries).toHaveLength(0)
    expect(r.totalWords).toBe(0)
    expect(r.uniqueWords).toBe(0)
  })

  it('whitespace-only returns zero counts', () => {
    const r = analyzeWordFrequency('   \n  ')
    expect(r.totalWords).toBe(0)
  })

  it('most frequent word is first entry', () => {
    const r = analyzeWordFrequency('the the the fox')
    expect(r.entries[0]?.word).toBe('the')
    expect(r.entries[0]?.count).toBe(3)
  })

  it('percentage of top word in 4-word input is 75', () => {
    const r = analyzeWordFrequency('the the the fox')
    expect(r.entries[0]?.percentage).toBe(75)
  })

  it('totalWords equals sum of all counts', () => {
    const r = analyzeWordFrequency('a b c a b a')
    const sum = r.entries.reduce((acc, e) => acc + e.count, 0)
    expect(r.totalWords).toBe(sum)
  })

  it('uniqueWords is count of distinct words', () => {
    const r = analyzeWordFrequency('a b c a b a')
    expect(r.uniqueWords).toBe(3)
  })

  it('entries are sorted by count descending', () => {
    const r = analyzeWordFrequency('a b c a b a')
    for (let i = 1; i < r.entries.length; i++) {
      expect(r.entries[i]!.count).toBeLessThanOrEqual(r.entries[i - 1]!.count)
    }
  })

  it('ignores numbers and punctuation', () => {
    const r = analyzeWordFrequency('hello, world! 123 test')
    const words = r.entries.map((e) => e.word)
    expect(words).not.toContain('123')
    expect(words).not.toContain(',')
    expect(words).toContain('hello')
    expect(words).toContain('world')
    expect(words).toContain('test')
  })

  it('is case-insensitive', () => {
    const r = analyzeWordFrequency('Hello hello HELLO')
    expect(r.entries[0]?.word).toBe('hello')
    expect(r.entries[0]?.count).toBe(3)
  })
})
