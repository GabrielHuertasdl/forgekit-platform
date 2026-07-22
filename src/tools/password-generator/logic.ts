export interface PasswordOptions {
  length: number
  uppercase: boolean
  numbers: boolean
  symbols: boolean
}

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong'

export interface PasswordResult {
  password: string
  strength: PasswordStrength
  entropy: number
  charsetSize: number
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function classifyStrength(entropy: number): PasswordStrength {
  if (entropy < 40) return 'weak'
  if (entropy < 60) return 'fair'
  if (entropy < 80) return 'strong'
  return 'very-strong'
}

export function generatePassword(options: PasswordOptions): PasswordResult {
  const { length, uppercase, numbers, symbols } = options

  let charset = LOWERCASE
  if (uppercase) charset += UPPERCASE
  if (numbers) charset += NUMBERS
  if (symbols) charset += SYMBOLS

  if (!charset) charset = LOWERCASE

  const clampedLength = Math.min(Math.max(length, 8), 64)
  const bytes = new Uint8Array(clampedLength * 4)
  globalThis.crypto.getRandomValues(bytes)

  let password = ''
  let i = 0
  while (password.length < clampedLength) {
    const byte = bytes[i++ % bytes.length]!
    const idx = byte % charset.length
    // Reject values that would introduce modulo bias for non-power-of-2 charsets
    if (byte < Math.floor(256 / charset.length) * charset.length) {
      password += charset[idx]
    }
    // If we run out of unbiased bytes, regenerate (extremely rare)
    if (i >= bytes.length && password.length < clampedLength) {
      const more = new Uint8Array(clampedLength * 4)
      globalThis.crypto.getRandomValues(more)
      bytes.set(more)
      i = 0
    }
  }

  const charsetSize = charset.length
  const entropy = Math.floor(clampedLength * Math.log2(charsetSize))

  return {
    password,
    strength: classifyStrength(entropy),
    entropy,
    charsetSize,
  }
}

export interface StrengthMeta {
  label: string
  colorClass: string
  widthClass: string
}

export function getStrengthMeta(strength: PasswordStrength): StrengthMeta {
  switch (strength) {
    case 'weak':        return { label: 'Weak',        colorClass: 'bg-red-500',    widthClass: 'w-1/4' }
    case 'fair':        return { label: 'Fair',        colorClass: 'bg-amber-500',  widthClass: 'w-2/4' }
    case 'strong':      return { label: 'Strong',      colorClass: 'bg-blue-500',   widthClass: 'w-3/4' }
    case 'very-strong': return { label: 'Very strong', colorClass: 'bg-green-500',  widthClass: 'w-full' }
  }
}
