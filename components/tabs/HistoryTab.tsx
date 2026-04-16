'use client'

import { useState, useEffect } from 'react'
import { CATS } from '@/lib/data'
import { getHistory, deleteResult } from '@/lib/history'
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

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleDelete = (id: string) => {
    if (!confirm('この保存データを削除しますか？')) return
    deleteResult(id)
    setHistory(getHistory())
  }

  const formatSavedAt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-1">
        スコアリング履歴
      </div>
      <p className="text-[12px] text-[#888] mb-4">
        保存したスコアリング結果の一覧です。「読み込む」でスコアリングシートに反映できます。
      </p>

      {history.length === 0 ? (
        <div className="bg-[#f7f6f3] rounded-xl p-8 text-center">
          <div className="text-[14px] text-[#aaa] mb-1">保存済みの結果がありません</div>
          <div className="text-[11px] text-[#bbb]">
            スコアリングシートで入力後、「保存」ボタンを押すとここに表示されます。
          </div>
        </div>
      ) : (
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
                    <div className="text-[11px] text-[#aaa] mt-0.5">ヒアリング日: {r.date}</div>
                  </div>
                  <div className="text-[10px] text-[#bbb] shrink-0 text-right">
                    保存: {formatSavedAt(r.savedAt)}
                  </div>
                </div>

                {/* スコア */}
                <div className="flex items-baseline gap-1.5 mb-3">
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
