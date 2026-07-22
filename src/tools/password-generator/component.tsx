'use client'

import { useState, useEffect, useCallback } from 'react'
import { generatePassword, getStrengthMeta, type PasswordOptions, type PasswordResult } from './logic'
import { cn } from '@/lib/utils'
import type { ToolProps } from '@/tools/_registry'

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  numbers: true,
  symbols: false,
}

export function PasswordGeneratorTool(_props: ToolProps) {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS)
  const [result, setResult] = useState<PasswordResult | null>(null)
  const [copied, setCopied] = useState(false)

  const regenerate = useCallback(() => {
    setResult(generatePassword(options))
  }, [options])

  useEffect(() => {
    regenerate()
  }, [regenerate])

  async function handleCopy() {
    if (!result?.password) return
    await navigator.clipboard.writeText(result.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function toggleOption(key: keyof Omit<PasswordOptions, 'length'>) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const strengthMeta = result ? getStrengthMeta(result.strength) : null

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Password output */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Generated password</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={result?.password ?? ''}
            className="flex-1 h-11 px-3 border border-border rounded-md bg-muted font-mono text-sm focus:outline-none"
            aria-label="Generated password"
          />
          <button
            onClick={handleCopy}
            className="h-11 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Strength meter */}
      {result && strengthMeta && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', strengthMeta.colorClass, strengthMeta.widthClass)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{strengthMeta.label}</span>
            {' '}— {result.entropy} bits entropy · {result.charsetSize} possible characters
          </p>
        </div>
      )}

      {/* Length slider */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground flex justify-between">
          <span>Length</span>
          <span className="font-semibold text-foreground tabular-nums">{options.length}</span>
        </label>
        <input
          type="range"
          min={8}
          max={64}
          step={1}
          value={options.length}
          onChange={(e) => setOptions((prev) => ({ ...prev, length: Number(e.target.value) }))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Character type toggles */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Include</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: 'uppercase', label: 'Uppercase A–Z' },
              { key: 'numbers',   label: 'Numbers 0–9' },
              { key: 'symbols',   label: 'Symbols !@#$' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleOption(key)}
              className={cn(
                'text-xs px-3 py-2 rounded-md border font-medium transition-colors text-center',
                options[key]
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Regenerate */}
      <button
        onClick={regenerate}
        className="text-sm text-primary hover:underline self-start"
      >
        ↻ Generate new password
      </button>
    </div>
  )
}
