'use client'

import { useState } from 'react'
import { Button } from '@/ui/components/ui/button'

interface Props {
  packId: string
}

export function BuyCreditsForm({ packId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      const data = (await res.json()) as { url?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleBuy} disabled={loading} size="sm" className="w-full">
        {loading ? 'Redirecting…' : 'Buy'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
