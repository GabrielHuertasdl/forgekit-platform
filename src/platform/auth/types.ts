import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export type AuthUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  creditsBalance: number
  isAdmin: boolean
}
