'use client'

import { useState } from 'react'
import { analyzeWordFrequency } from './logic'
import type { ToolProps } from '@/tools/_registry'

export function WordFrequencyTool(_props: ToolProps) {
  const [input, setInput] = useState('')

  const result = analyzeWordFrequency(input)
  const topEntries = result.entries.slice(0, 50)

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Input text</label>
        <textarea
          className="h-40 p-3 border border-border rounded-md bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Paste your text here to analyze word frequency…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Summary */}
      {result.totalWords > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{result.uniqueWords.toLocaleString()}</span> unique words
          {' · '}
          <span className="font-semibold text-foreground">{result.totalWords.toLocaleString()}</span> total
          {topEntries.length < result.entries.length && ` · showing top ${topEntries.length}`}
        </p>
      )}

      {/* Frequency table */}
      {topEntries.length > 0 ? (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Word</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Count</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Frequency</th>
                  <th className="px-4 py-2 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topEntries.map((entry, i) => {
                  const barWidth = Math.round((entry.count / (topEntries[0]?.count ?? 1)) * 100)
                  return (
                    <tr key={entry.word} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-4 py-2 font-mono font-medium">{entry.word}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{entry.count}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{entry.percentage}%</td>
                      <td className="px-4 py-2">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        input.trim() === '' && (
          <div className="rounded-md border border-border bg-muted/30 py-12 text-center">
            <p className="text-sm text-muted-foreground">Paste text above to see word frequency.</p>
          </div>
        )
      )}
    </div>
  )
}
