'use client'

import { useState, useEffect, useCallback } from 'react'
import { CATS } from '@/lib/data'
import type { SavedResult } from '@/types'

const CAT_MAX = [8, 12, 12, 12]
const LEVEL_COLOR: Record<string, string> = {
  'Lv.1 リアクティブ':         '#A32D2D',
  'Lv.1〜2 移行期':            '#7A5500',
  'Lv.2 標準化':               '#534AB7',
  'Lv.3 プロアクティブ移行期':  '#0F6E56',
  'Lv.3〜4 戦略的・競争優位':   '#085041',
}

interface Props {
  onLoad: (result: SavedResult) => void
}

export default function HistoryTab({ onLoad }: Props) {
  const [history, setHistory] = useState<SavedResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/history', { cache: 'no-store' })
      const data = await res.json() as { entries?: SavedResult[]; error?: string }
      if (!res.ok) throw new Error(data.error || '読み込みに失敗しました')
      setHistory(data.entries ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('この保存データを削除しますか？（Notion 上ではアーカイブされます）')) return
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error || '削除に失敗しました')
      setHistory((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      alert(`削除に失敗しました: ${message}`)
    }
  }

  const formatSavedAt = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase">
          スコアリング履歴（チーム共有）
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-[11px] text-[#888] border border-[#e0ddd6] px-2 py-0.5 rounded cursor-pointer bg-white hover:bg-[#f7f6f3] disabled:opacity-50"
        >
          {loading ? '更新中…' : '再読み込み'}
        </button>
      </div>
      <p className="text-[12px] text-[#888] mb-4">
        Notion DB に保存された履歴の一覧です。チーム全員で共有されます。「読み込む」でスコアリングシートに反映できます。
      </p>

      {loading && (
        <div className="bg-[#f7f6f3] rounded-xl p-6 text-center text-[13px] text-[#aaa]">
          読み込み中…
        </div>
      )}

      {!loading && error && (
        <div className="bg-[#FCEBEB] border border-[#F3C2C2] rounded-xl p-4 text-[12px] text-[#791F1F]">
          読み込みに失敗しました: {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="bg-[#f7f6f3] rounded-xl p-8 text-center">
          <div className="text-[14px] text-[#aaa] mb-1">保存済みの結果がありません</div>
          <div className="text-[11px] text-[#bbb]">
            スコアリングシートで入力後、「保存」ボタンを押すとここに表示されます。
          </div>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {history.map((r) => {
            const levelColor = LEVEL_COLOR[r.level] ?? '#888'
            return (
              <div key={r.id} className="border border-[#e8e6e0] rounded-xl p-4 bg-white">
                {/* ヘッダー */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-[14px] font-bold text-[#1a1a1a] leading-tight">
                      {r.company || '（会社名なし）'}
                    </div>
                    <div className="text-[11px] text-[#aaa] mt-0.5">
                      ヒアリング日: {r.date || '—'}
                      {r.savedBy && <span className="ml-2">保存者: {r.savedBy}</span>}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#bbb] shrink-0 text-right">
                    保存: {formatSavedAt(r.savedAt)}
                  </div>
                </div>

                {/* 現在スコア */}
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[22px] font-bold" style={{ color: levelColor }}>{r.grand}</span>
                  <span className="text-[12px] text-[#aaa]">/ 44点</span>
                  <span
                    className="ml-1 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                    style={{ background: `${levelColor}18`, color: levelColor }}
                  >
                    {r.level}
                  </span>
                </div>

                {/* カテゴリ別スコア */}
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {CATS.map((name, c) => (
                    <div key={c} className="text-center">
                      <div className="text-[9px] text-[#aaa] leading-tight mb-0.5">{name}</div>
                      <div className="text-[13px] font-medium text-[#1a1a1a]">
                        {r.catTotals[c] > 0 ? r.catTotals[c] : '—'}
                        <span className="text-[9px] text-[#ccc]">/{CAT_MAX[c]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 比較スコア */}
                {r.compareScores && r.compareGrand != null && (
                  <div className="border-t border-dashed border-[#EF9F27] pt-2 mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="inline-block w-4" style={{ borderTop: '2px dashed #EF9F27', height: 0 }} />
                      <span className="text-[10px] font-medium text-[#7A3800]">
                        比較: {r.compareCompany || '（会社名なし）'}
                        {r.compareDate && <span className="text-[#aaa] ml-1">（{r.compareDate}）</span>}
                      </span>
                      <span
                        className="ml-auto text-[11px] font-bold"
                        style={{ color: LEVEL_COLOR[r.compareLevel ?? ''] ?? '#EF9F27' }}
                      >
                        {r.compareGrand}点
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {CATS.map((name, c) => (
                        <div key={c} className="text-center">
                          <div className="text-[9px] text-[#aaa] leading-tight mb-0.5">{name}</div>
                          <div className="text-[12px] font-medium text-[#EF9F27]">
                            {r.compareCatTotals?.[c] ? r.compareCatTotals[c] : '—'}
                            <span className="text-[9px] text-[#ccc]">/{CAT_MAX[c]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* アクション */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoad(r)}
                    className="flex-1 py-1.5 text-[12px] font-medium bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] cursor-pointer transition-colors"
                  >
                    読み込む
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1.5 text-[12px] text-[#aaa] border border-[#e0ddd6] rounded-lg hover:bg-[#f7f6f3] cursor-pointer transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
