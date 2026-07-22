export type JsonMode = 'format' | 'minify'

export interface JsonResult {
  output: string
  isValid: boolean
  error?: string
  charCount: number
  lineCount: number
}

export function processJson(input: string, mode: JsonMode = 'format'): JsonResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { output: '', isValid: true, charCount: 0, lineCount: 0 }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    const output =
      mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)

    return {
      output,
      isValid: true,
      charCount: output.length,
      lineCount: output.split('\n').length,
    }
  } catch (err) {
    return {
      output: '',
      isValid: false,
      error: err instanceof SyntaxError ? err.message : 'Invalid JSON',
      charCount: 0,
      lineCount: 0,
    }
  }
}
