import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { searchTools } from '@/platform/search'
import { TOOL_CATEGORIES } from '@/tools/_registry'
import type { ToolCategory } from '@/tools/_registry'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''
  const rawCategory = searchParams.get('category')

  const category =
    rawCategory && (TOOL_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as ToolCategory)
      : undefined

  const results = searchTools(q, { category })
  return NextResponse.json({ results, total: results.length })
}
