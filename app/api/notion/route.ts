import { NextRequest, NextResponse } from 'next/server'
import { saveAssessment } from '@/lib/notion'
import type { NotionSavePayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const payload: NotionSavePayload = await req.json()

    if (!payload.company?.trim()) {
      return NextResponse.json({ error: '投資先名が入力されていません' }, { status: 400 })
    }
    if (!payload.grand) {
      return NextResponse.json({ error: 'スコアが入力されていません' }, { status: 400 })
    }

    const pageUrl = await saveAssessment(payload)
    return NextResponse.json({ success: true, url: pageUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[notion/route] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
