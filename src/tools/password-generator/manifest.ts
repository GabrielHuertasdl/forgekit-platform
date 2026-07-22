import type { ToolManifest } from '@/tools/_registry'

export const manifest: ToolManifest = {
  slug: 'password-generator',
  name: 'Password Generator',
  description: 'Generate secure random passwords with custom length and character types.',
  longDescription:
    'Create cryptographically random passwords using the Web Crypto API. Choose your desired length (8–64 characters), toggle uppercase letters, numbers, and symbols. A live strength meter shows estimated entropy so you know exactly how secure your password is.',
  category: 'security',
  stateMode: 'stateless',
  status: 'active',
  version: '1.0.0',
  creditsPerUse: 0,
  isPremium: false,
  tags: ['password', 'security', 'random', 'generator', 'crypto', 'strong password'],
  icon: 'KeyRound',
  keywords: [
    'password generator',
    'secure password generator',
    'random password online',
    'strong password generator',
    'free password generator',
    'password maker',
  ],
}
