import { NextResponse } from 'next/server'
import { auth } from '@/platform/auth'
import { getBalance } from '@/platform/credits'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const balance = await getBalance(session.user.id)
  return NextResponse.json({ balance })
}
