import { describe, it, expect } from 'vitest'
import { processBase64 } from '@/tools/base64-encoder/logic'

describe('processBase64', () => {
  it('returns empty for empty input', () => {
    const r = processBase64('', 'encode')
    expect(r.output).toBe('')
    expect(r.success).toBe(true)
  })

  it('encodes ASCII text', () => {
    const r = processBase64('hello', 'encode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('aGVsbG8=')
  })

  it('decodes Base64 back to ASCII', () => {
    const r = processBase64('aGVsbG8=', 'decode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('hello')
  })

  it('round-trips ASCII text', () => {
    const text = 'Hello, World! 123 #$%'
    const encoded = processBase64(text, 'encode')
    const decoded = processBase64(encoded.output, 'decode')
    expect(decoded.output).toBe(text)
  })

  it('encodes Unicode / emoji', () => {
    const r = processBase64('café ☕', 'encode')
    expect(r.success).toBe(true)
    expect(r.output.length).toBeGreaterThan(0)
  })

  it('round-trips Unicode text', () => {
    const text = 'こんにちは 🌸'
    const encoded = processBase64(text, 'encode')
    const decoded = processBase64(encoded.output, 'decode')
    expect(decoded.output).toBe(text)
  })

  it('returns error for invalid Base64', () => {
    const r = processBase64('!!!not base64!!!', 'decode')
    expect(r.success).toBe(false)
    expect(r.error).toBeDefined()
  })

  it('reports correct input and output lengths', () => {
    const text = 'test'
    const r = processBase64(text, 'encode')
    expect(r.inputLength).toBe(text.length)
    expect(r.outputLength).toBe(r.output.length)
  })

  it('trims whitespace from Base64 before decoding', () => {
    const r = processBase64('  aGVsbG8=  ', 'decode')
    expect(r.success).toBe(true)
    expect(r.output).toBe('hello')
  })
})
