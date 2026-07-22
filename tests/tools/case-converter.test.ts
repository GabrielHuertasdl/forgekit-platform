import { describe, it, expect } from 'vitest'
import { convertCase } from '@/tools/case-converter/logic'

describe('convertCase', () => {
  it('upper — converts to UPPER CASE', () => {
    expect(convertCase('hello world', 'upper')).toBe('HELLO WORLD')
  })

  it('lower — converts to lower case', () => {
    expect(convertCase('HELLO WORLD', 'lower')).toBe('hello world')
  })

  it('title — capitalizes each word', () => {
    expect(convertCase('hello world', 'title')).toBe('Hello World')
  })

  it('sentence — capitalizes first letter only', () => {
    expect(convertCase('hello world', 'sentence')).toBe('Hello world')
  })

  it('camel — produces camelCase', () => {
    expect(convertCase('hello world foo', 'camel')).toBe('helloWorldFoo')
  })

  it('camel — handles mixed separators', () => {
    expect(convertCase('hello-world_foo', 'camel')).toBe('helloWorldFoo')
  })

  it('kebab — produces kebab-case', () => {
    expect(convertCase('Hello World', 'kebab')).toBe('hello-world')
  })

  it('kebab — strips leading/trailing hyphens', () => {
    expect(convertCase('  hello world  ', 'kebab')).toBe('hello-world')
  })

  it('snake — produces snake_case', () => {
    expect(convertCase('Hello World', 'snake')).toBe('hello_world')
  })

  it('snake — strips leading/trailing underscores', () => {
    expect(convertCase('  hello world  ', 'snake')).toBe('hello_world')
  })

  it('returns empty string for empty input', () => {
    const caseTypes = ['upper', 'lower', 'title', 'sentence', 'camel', 'kebab', 'snake'] as const
    for (const type of caseTypes) {
      expect(convertCase('', type)).toBe('')
    }
  })
})
