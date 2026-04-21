import { NextRequest, NextResponse } from 'next/server'
import { archiveHistoryEntry } from '@/lib/notion'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'id がありません' }, { status: 400 })
    }
    await archiveHistoryEntry(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[history/[id] DELETE] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
