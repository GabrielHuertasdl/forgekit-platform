'use client'

import { useState } from 'react'
import { analyzeText, type TextStats } from './logic'
import type { ToolProps } from '@/tools/_registry'

const STAT_LABELS: { key: keyof TextStats; label: string }[] = [
  { key: 'words', label: 'Words' },
  { key: 'characters', label: 'Characters' },
  { key: 'charactersNoSpaces', label: 'Characters (no spaces)' },
  { key: 'sentences', label: 'Sentences' },
  { key: 'paragraphs', label: 'Paragraphs' },
  { key: 'readingTimeMinutes', label: 'Reading time (min)' },
]

export function TextCounterTool(_props: ToolProps) {
  const [text, setText] = useState('')
  const stats = analyzeText(text)

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <textarea
        className="w-full h-48 p-3 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Paste or type your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Text input"
      />
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STAT_LABELS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1 p-3 rounded-md bg-muted">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{stats[key].toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
