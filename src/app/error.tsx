'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ForgeKit error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-destructive mb-4">!</p>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">ID: {error.digest}</p>
        )}
        <button onClick={reset} className="text-sm text-primary hover:underline">
          Try again
        </button>
      </div>
    </div>
  )
}
