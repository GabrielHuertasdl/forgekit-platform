import { describe, it, expect } from 'vitest'
import { generateLorem } from '@/tools/lorem-ipsum-generator/logic'

describe('generateLorem', () => {
  it('paragraphs — starts with "Lorem ipsum"', () => {
    expect(generateLorem('paragraphs', 1)).toMatch(/^Lorem ipsum/)
  })

  it('paragraphs — 3 paragraphs separated by double newlines', () => {
    const result = generateLorem('paragraphs', 3)
    const parts = result.split('\n\n')
    expect(parts.length).toBe(3)
  })

  it('paragraphs — 1 paragraph has no double newline', () => {
    const result = generateLorem('paragraphs', 1)
    expect(result).not.toContain('\n\n')
  })

  it('sentences — returns single block ending with a period', () => {
    const result = generateLorem('sentences', 2)
    expect(result.trim()).toMatch(/\.$/)
  })

  it('words — returns exactly N words', () => {
    const result = generateLorem('words', 5)
    const words = result.trim().split(/\s+/)
    expect(words.length).toBe(5)
  })

  it('words — first word is capitalized', () => {
    const result = generateLorem('words', 3)
    expect(result[0]).toBe(result[0]!.toUpperCase())
  })

  it('clamps count below 1 to 1', () => {
    const result = generateLorem('words', 0)
    const words = result.trim().split(/\s+/)
    expect(words.length).toBe(1)
  })

  it('clamps count above 100 to 100', () => {
    const result = generateLorem('words', 200)
    const words = result.trim().split(/\s+/)
    expect(words.length).toBe(100)
  })
})
