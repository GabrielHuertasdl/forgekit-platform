'use client'

import { useState } from 'react'
import { processJson, type JsonMode } from './logic'
import type { ToolProps } from '@/tools/_registry'

const MODES: { value: JsonMode; label: string }[] = [
  { value: 'format', label: 'Format' },
  { value: 'minify', label: 'Minify' },
]

export function JsonFormatterTool(_props: ToolProps) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<JsonMode>('format')
  const [copied, setCopied] = useState(false)

  const result = processJson(input, mode)

  async function handleCopy() {
    if (!result.output) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode selector */}
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
        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Input JSON</label>
          <textarea
            className="h-72 p-3 border border-border rounded-md bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='{"key": "value"}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            {result.isValid && result.output && (
              <span className="text-xs text-muted-foreground">
                {result.charCount.toLocaleString()} chars · {result.lineCount} lines
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              readOnly
              className={`h-72 w-full p-3 border rounded-md bg-muted text-sm font-mono resize-y focus:outline-none ${
                result.isValid ? 'border-border' : 'border-destructive'
              }`}
              value={result.error ?? result.output}
              aria-label="Formatted output"
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
          {!result.isValid && result.error && (
            <p className="text-xs text-destructive">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
