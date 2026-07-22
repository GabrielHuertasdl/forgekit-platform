export type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'kebab' | 'snake'

export interface CaseOption {
  type: CaseType
  label: string
  example: string
}

export const CASE_OPTIONS: CaseOption[] = [
  { type: 'upper',    label: 'UPPER CASE',    example: 'HELLO WORLD' },
  { type: 'lower',    label: 'lower case',    example: 'hello world' },
  { type: 'title',    label: 'Title Case',    example: 'Hello World' },
  { type: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { type: 'camel',    label: 'camelCase',     example: 'helloWorld' },
  { type: 'kebab',    label: 'kebab-case',    example: 'hello-world' },
  { type: 'snake',    label: 'snake_case',    example: 'hello_world' },
]

export function convertCase(text: string, caseType: CaseType): string {
  if (!text) return ''

  switch (caseType) {
    case 'upper':
      return text.toUpperCase()

    case 'lower':
      return text.toLowerCase()

    case 'title':
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

    case 'camel': {
      const words = text.toLowerCase().split(/[^a-z0-9]+/)
      return words
        .filter(Boolean)
        .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join('')
    }

    case 'kebab':
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    case 'snake':
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
  }
}
