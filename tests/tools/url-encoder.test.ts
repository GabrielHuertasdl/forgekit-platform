import { describe, it, expect } from 'vitest'
import { processUrl } from '@/tools/url-encoder/logic'

describe('processUrl', () => {
  it('returns empty for empty input', () => {
    const r = processUrl('', 'encode')
    expect(r.output).toBe('')
    expect(r.success).toBe(true)
  })

  it('encodes special characters', () => {
    const r = processUrl('hello world', 'encode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('hello%20world')
  })

  it('encodes ampersand and equals', () => {
    const r = processUrl('a=1&b=2', 'encode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('a%3D1%26b%3D2')
  })

  it('decodes percent-encoded string', () => {
    const r = processUrl('hello%20world', 'decode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('hello world')
  })

  it('round-trips plain text', () => {
    const text = 'search?q=hello world&lang=en'
    const encoded = processUrl(text, 'encode')
    const decoded = processUrl(encoded.output, 'decode')
    expect(decoded.output).toBe(text)
  })

  it('handles Unicode characters', () => {
    const r = processUrl('café', 'encode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('caf%C3%A9')
  })

  it('round-trips Unicode', () => {
    const text = 'こんにちは'
    const encoded = processUrl(text, 'encode')
    const decoded = processUrl(encoded.output, 'decode')
    expect(decoded.output).toBe(text)
  })

  it('returns error for malformed percent encoding', () => {
    const r = processUrl('%ZZ', 'decode')
    expect(r.success).toBe(false)
    expect(r.error).toBeDefined()
  })

  it('reports correct lengths', () => {
    const text = 'a b'
    const r = processUrl(text, 'encode')
    expect(r.inputLength).toBe(3)
    expect(r.outputLength).toBe(r.output.length)
  })
})
