import { describe, it, expect } from 'vitest'
import { generatePassword, getStrengthMeta } from '@/tools/password-generator/logic'

describe('generatePassword', () => {
  it('returns a string of the correct length', () => {
    const r = generatePassword({ length: 16, uppercase: true, numbers: true, symbols: false })
    expect(r.password).toHaveLength(16)
  })

  it('respects minimum length of 8', () => {
    const r = generatePassword({ length: 4, uppercase: false, numbers: false, symbols: false })
    expect(r.password.length).toBeGreaterThanOrEqual(8)
  })

  it('respects maximum length of 64', () => {
    const r = generatePassword({ length: 100, uppercase: true, numbers: true, symbols: true })
    expect(r.password.length).toBeLessThanOrEqual(64)
  })

  it('only contains lowercase when all other options are off', () => {
    const r = generatePassword({ length: 64, uppercase: false, numbers: false, symbols: false })
    expect(r.password).toMatch(/^[a-z]+$/)
  })

  it('can contain digits when numbers is true', () => {
    // Large length to ensure statistical inclusion
    let hasDigit = false
    for (let i = 0; i < 10; i++) {
      const r = generatePassword({ length: 32, uppercase: false, numbers: true, symbols: false })
      if (/[0-9]/.test(r.password)) { hasDigit = true; break }
    }
    expect(hasDigit).toBe(true)
  })

  it('can contain symbols when symbols is true', () => {
    let hasSymbol = false
    for (let i = 0; i < 10; i++) {
      const r = generatePassword({ length: 32, uppercase: false, numbers: false, symbols: true })
      if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(r.password)) { hasSymbol = true; break }
    }
    expect(hasSymbol).toBe(true)
  })

  it('computes entropy as floor(length * log2(charsetSize))', () => {
    const r = generatePassword({ length: 16, uppercase: false, numbers: false, symbols: false })
    const expected = Math.floor(16 * Math.log2(r.charsetSize))
    expect(r.entropy).toBe(expected)
  })

  it('returns a strength value', () => {
    const r = generatePassword({ length: 16, uppercase: true, numbers: true, symbols: true })
    expect(['weak', 'fair', 'strong', 'very-strong']).toContain(r.strength)
  })
})

describe('getStrengthMeta', () => {
  it('weak → w-1/4', () => {
    expect(getStrengthMeta('weak').widthClass).toBe('w-1/4')
  })
  it('fair → w-2/4', () => {
    expect(getStrengthMeta('fair').widthClass).toBe('w-2/4')
  })
  it('strong → w-3/4', () => {
    expect(getStrengthMeta('strong').widthClass).toBe('w-3/4')
  })
  it('very-strong → w-full', () => {
    expect(getStrengthMeta('very-strong').widthClass).toBe('w-full')
  })
  it('returns a label string for every strength', () => {
    const strengths = ['weak', 'fair', 'strong', 'very-strong'] as const
    for (const s of strengths) {
      expect(getStrengthMeta(s).label).toBeTruthy()
    }
  })
})
