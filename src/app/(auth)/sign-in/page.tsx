import Link from 'next/link'
import type { Metadata } from 'next'
import { signIn } from '@/platform/auth'
import { Button } from '@/ui/components/ui/button'

export const metadata: Metadata = {
  title: 'Sign in — ForgeKit',
}

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams
  const redirectTo = callbackUrl ?? '/dashboard'

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-semibold text-base tracking-tight text-foreground hover:opacity-70 transition-opacity"
        >
          ForgeKit
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Your tools are waiting.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to track your history and manage credits.
          </p>
        </div>

        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo })
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Continue with Google
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Free tools work without an account.
        </p>
      </div>
    </div>
  )
}
