'use client'

import { useState } from 'react'
import { convertCase, CASE_OPTIONS, type CaseType } from './logic'
import { cn } from '@/lib/utils'
import type { ToolProps } from '@/tools/_registry'

export function CaseConverterTool(_props: ToolProps) {
  const [input, setInput] = useState('')
  const [activeCase, setActiveCase] = useState<CaseType>('title')
  const [copied, setCopied] = useState(false)

  const output = convertCase(input, activeCase)

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Input text</label>
        <textarea
          className="h-36 p-3 border border-border rounded-md bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type or paste your text here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Case options */}
      <div className="flex flex-wrap gap-2">
        {CASE_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setActiveCase(opt.type)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
              activeCase === opt.type
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted',
            )}
            title={`Example: ${opt.example}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Result</label>
          {output && (
            <span className="text-xs text-muted-foreground">
              {output.length.toLocaleString()} chars
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            readOnly
            className="h-36 w-full p-3 border border-border rounded-md bg-muted text-sm font-mono resize-y focus:outline-none"
            value={output}
            aria-label="Converted text"
            placeholder="Result will appear here…"
          />
          {output && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background border border-border hover:bg-muted transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
