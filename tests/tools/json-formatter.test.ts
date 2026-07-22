import { describe, it, expect } from 'vitest'
import { processJson } from '@/tools/json-formatter/logic'

describe('processJson', () => {
  it('returns empty output for empty input', () => {
    const r = processJson('')
    expect(r.output).toBe('')
    expect(r.isValid).toBe(true)
    expect(r.charCount).toBe(0)
  })

  it('returns empty output for whitespace-only input', () => {
    const r = processJson('   \n  ')
    expect(r.isValid).toBe(true)
    expect(r.output).toBe('')
  })

  it('formats valid JSON with 2-space indentation', () => {
    const r = processJson('{"a":1,"b":2}')
    expect(r.isValid).toBe(true)
    expect(r.output).toBe('{\n  "a": 1,\n  "b": 2\n}')
  })

  it('minifies JSON when mode is minify', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}'
    const r = processJson(input, 'minify')
    expect(r.isValid).toBe(true)
    expect(r.output).toBe('{"a":1,"b":2}')
  })

  it('handles nested objects', () => {
    const r = processJson('{"a":{"b":{"c":1}}}')
    expect(r.isValid).toBe(true)
    expect(JSON.parse(r.output)).toEqual({ a: { b: { c: 1 } } })
  })

  it('handles arrays', () => {
    const r = processJson('[1,2,3]')
    expect(r.isValid).toBe(true)
    expect(JSON.parse(r.output)).toEqual([1, 2, 3])
  })

  it('returns error for invalid JSON', () => {
    const r = processJson('{not valid json}')
    expect(r.isValid).toBe(false)
    expect(r.error).toBeDefined()
    expect(r.output).toBe('')
  })

  it('reports correct charCount and lineCount', () => {
    const r = processJson('{"a":1}')
    expect(r.charCount).toBe(r.output.length)
    expect(r.lineCount).toBe(r.output.split('\n').length)
  })

  it('trims surrounding whitespace before parsing', () => {
    const r = processJson('  {"a":1}  ')
    expect(r.isValid).toBe(true)
  })

  it('handles string values', () => {
    const r = processJson('"hello world"')
    expect(r.isValid).toBe(true)
    expect(JSON.parse(r.output)).toBe('hello world')
  })

  it('handles null', () => {
    const r = processJson('null')
    expect(r.isValid).toBe(true)
    expect(JSON.parse(r.output)).toBeNull()
  })
})
