export type UrlMode = 'encode' | 'decode'

export interface UrlResult {
  output: string
  success: boolean
  error?: string
  inputLength: number
  outputLength: number
}

export function processUrl(input: string, mode: UrlMode): UrlResult {
  if (!input) {
    return { output: '', success: true, inputLength: 0, outputLength: 0 }
  }

  try {
    const output =
      mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
    return { output, success: true, inputLength: input.length, outputLength: output.length }
  } catch {
    return {
      output: '',
      success: false,
      error: mode === 'decode' ? 'Invalid percent-encoded string' : 'Encoding failed',
      inputLength: input.length,
      outputLength: 0,
    }
  }
}
