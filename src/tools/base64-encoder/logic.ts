export type Base64Mode = 'encode' | 'decode'

export interface Base64Result {
  output: string
  success: boolean
  error?: string
  inputLength: number
  outputLength: number
}

export function processBase64(input: string, mode: Base64Mode): Base64Result {
  if (!input) {
    return { output: '', success: true, inputLength: 0, outputLength: 0 }
  }

  try {
    if (mode === 'encode') {
      const bytes = new TextEncoder().encode(input)
      const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
      const output = btoa(binary)
      return { output, success: true, inputLength: input.length, outputLength: output.length }
    } else {
      const binary = atob(input.trim())
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const output = new TextDecoder().decode(bytes)
      return { output, success: true, inputLength: input.length, outputLength: output.length }
    }
  } catch {
    return {
      output: '',
      success: false,
      error: mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed',
      inputLength: input.length,
      outputLength: 0,
    }
  }
}
