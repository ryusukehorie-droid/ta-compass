import { NextRequest, NextResponse } from 'next/server'
import { saveHistoryEntry, listHistoryEntries } from '@/lib/notion'
import type { SavedResult } from '@/types'

export async function GET() {
  try {
    const entries = await listHistoryEntries()
    return NextResponse.json({ entries })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[history/route GET] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as SavedResult

    if (!payload.company?.trim()) {
      return NextResponse.json({ error: '会社名が入力されていません' }, { status: 400 })
    }
    if (!payload.grand) {
      return NextResponse.json({ error: 'スコアが入力されていません' }, { status: 400 })
    }
    if (!Array.isArray(payload.scores)) {
      return NextResponse.json({ error: 'scores が不正です' }, { status: 400 })
    }

    const pageId = await saveHistoryEntry(payload)
    return NextResponse.json({ success: true, id: pageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[history/route POST] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
