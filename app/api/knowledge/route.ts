import { NextRequest, NextResponse } from 'next/server'
import { fetchKnowledge, createKnowledge } from '@/lib/knowledgeNotion'
import type { DiagLevel, KnowledgeType } from '@/types'

// GET /api/knowledge?item=0&level=BAD&type=施策・アクション
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const itemParam  = searchParams.get('item')
    const levelParam = searchParams.get('level') as DiagLevel | null
    const typeParam  = searchParams.get('type') as KnowledgeType | null

    const entries = await fetchKnowledge({
      itemIndex: itemParam !== null ? Number(itemParam) : undefined,
      level:     levelParam ?? undefined,
      type:      typeParam  ?? undefined,
    })
    return NextResponse.json(entries)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[knowledge GET]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/knowledge  body: KnowledgeCreatePayload
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    if (!payload.title?.trim())   return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
    if (!payload.type)            return NextResponse.json({ error: 'タイプは必須です' }, { status: 400 })
    if (!payload.body?.trim())    return NextResponse.json({ error: '本文は必須です' }, { status: 400 })

    const entry = await createKnowledge(payload)
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[knowledge POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
