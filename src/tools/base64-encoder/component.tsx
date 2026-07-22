'use client'

import { useState } from 'react'
import { processBase64, type Base64Mode } from './logic'
import type { ToolProps } from '@/tools/_registry'

const MODES: { value: Base64Mode; label: string }[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]

export function Base64EncoderTool(_props: ToolProps) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Base64Mode>('encode')
  const [copied, setCopied] = useState(false)

  const result = processBase64(input, mode)

  async function handleCopy() {
    if (!result.output) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === m.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {mode === 'encode' ? 'Plain text' : 'Base64 string'}
          </label>
          <textarea
            className="h-72 p-3 border border-border rounded-md bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
            </label>
            {result.success && result.output && (
              <span className="text-xs text-muted-foreground">
                {result.outputLength.toLocaleString()} chars
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              readOnly
              className={`h-72 w-full p-3 border rounded-md bg-muted text-sm font-mono resize-y focus:outline-none ${
                result.success ? 'border-border' : 'border-destructive'
              }`}
              value={result.error ?? result.output}
              aria-label="Output"
            />
            {result.output && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background border border-border hover:bg-muted transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {!result.success && result.error && (
            <p className="text-xs text-destructive">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
