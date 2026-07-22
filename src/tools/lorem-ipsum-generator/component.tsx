'use client'

import { useState } from 'react'
import { generateLorem, type LoremType } from './logic'
import { cn } from '@/lib/utils'
import type { ToolProps } from '@/tools/_registry'

const TYPES: { value: LoremType; label: string }[] = [
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'sentences',  label: 'Sentences' },
  { value: 'words',      label: 'Words' },
]

export function LoremIpsumGeneratorTool(_props: ToolProps) {
  const [type, setType] = useState<LoremType>('paragraphs')
  const [count, setCount] = useState(3)
  const [copied, setCopied] = useState(false)

  const output = generateLorem(type, count)

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'text-sm px-4 py-1.5 rounded-md font-medium transition-colors',
                type === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="lorem-count" className="text-xs font-medium text-muted-foreground">
            Count
          </label>
          <input
            id="lorem-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            className="w-20 h-8 px-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
          />
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Generated text</label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {output.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 rounded bg-background border border-border hover:bg-muted transition-colors"
            >
              {copied ? 'Copied!' : 'Copy all'}
            </button>
          </div>
        </div>
        <textarea
          readOnly
          className="h-72 w-full p-3 border border-border rounded-md bg-muted text-sm leading-relaxed resize-y focus:outline-none"
          value={output}
          aria-label="Lorem ipsum output"
        />
      </div>
    </div>
  )
}
