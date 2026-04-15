'use client'

import { useState, useEffect } from 'react'
import { ITEMS, CATS, getLevelLabel } from '@/lib/data'
import type { ScoreValue, NotionSavePayload } from '@/types'

const SCORE_LABEL = ['未評価', 'BAD', 'SOSO', 'GOOD', 'EXC'] as const
const SCORE_COL   = ['#aaa', '#791F1F', '#7A5500', '#27500A', '#085041']
const SCORE_BG    = ['#f7f6f3', '#FCEBEB', '#FFF3CC', '#EAF3DE', '#E1F5EE']
const CAT_MAX     = [8, 12, 12, 12]

interface Props {
  scores: ScoreValue[]
}

export default function NotionTab({ scores }: Props) {
  const [company, setCompany] = useState('')
  const [stage, setStage]     = useState('')
  const [date, setDate]       = useState('')
  const [memo, setMemo]       = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState<{ ok: boolean; msg: string; url?: string } | null>(null)

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0])
  }, [])

  const totals: number[] = [0, 0, 0, 0]
  const counts: number[] = [0, 0, 0, 0]
  let grand = 0
  scores.forEach((v, i) => {
    if (v > 0) { totals[ITEMS[i].cat] += v; counts[ITEMS[i].cat]++; grand += v }
  })

  const levelLabel = grand > 0 ? getLevelLabel(grand) : ''

  const handleSave = async () => {
    if (!company.trim()) {
      setStatus({ ok: false, msg: '⚠ 投資先名を入力してください' })
      return
    }
    if (!grand) {
      setStatus({ ok: false, msg: '⚠ スコアが入力されていません。タブ4でスコアを入力してください' })
      return
    }

    const scoreMap: Record<string, string> = {}
    scores.forEach((v, i) => { scoreMap[ITEMS[i].name] = SCORE_LABEL[v] })

    const payload: NotionSavePayload = {
      company: company.trim(),
      stage: stage || '未分類',
      date: date || new Date().toISOString().split('T')[0],
      memo: memo.trim(),
      grand,
      level: levelLabel,
      scores: scoreMap,
      catScores: {
        経営アラインメント: totals[0],
        'マーケティング＆ソーシング': totals[1],
        'セレクション＆クロージング': totals[2],
        'TA体制・システム': totals[3],
      },
    }

    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setStatus({ ok: true, msg: '✅ Notionに保存しました！', url: json.url })
      } else {
        setStatus({ ok: false, msg: `⚠ 保存に失敗しました: ${json.error ?? res.statusText}` })
      }
    } catch (e) {
      setStatus({ ok: false, msg: `⚠ ネットワークエラー: ${e instanceof Error ? e.message : String(e)}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-1">Notionに保存</div>
      <p className="text-[12px] text-[#888] mb-4">スコアリング結果と所感をNotionのナレッジDBに保存します。初回実行時にDBを自動作成します。</p>

      {/* 投資先情報 */}
      <div className="bg-white border border-[#e8e6e0] rounded-xl p-4 mb-3">
        <div className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-3">投資先情報</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <div>
            <div className="text-[11px] text-[#888] mb-1">投資先名 *</div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="例：〇〇株式会社"
              className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7]"
            />
          </div>
          <div>
            <div className="text-[11px] text-[#888] mb-1">ステージ</div>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] bg-white outline-none focus:border-[#534AB7]"
            >
              <option value="">選択してください</option>
              <option>プレシリーズA</option>
              <option>シリーズA</option>
              <option>シリーズB</option>
              <option>シリーズC以降</option>
              <option>未分類</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] text-[#888] mb-1">ヒアリング日</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7]"
            />
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#888] mb-1">ヒアリングメモ・所感</div>
          <textarea
            rows={4}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="気になった点、印象、次のアクションなどを自由に記載"
            className="w-full px-2.5 py-2 border border-[#e0ddd6] rounded-lg text-[12px] resize-y outline-none leading-relaxed focus:border-[#534AB7]"
          />
        </div>
      </div>

      {/* Score preview */}
      <div className="bg-[#f7f6f3] rounded-xl p-4 mb-3">
        <div className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-3">
          スコアリング結果（タブ4で入力したスコアを反映）
        </div>
        {grand === 0 ? (
          <p className="text-[12px] text-[#aaa] italic">スコアがまだ入力されていません。先にタブ4「スコアリング」でスコアを入力してください。</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {CATS.map((name, c) => (
                <div key={c} className="p-2 bg-white border border-[#e8e6e0] rounded-lg">
                  <div className="text-[10px] text-[#888] mb-0.5">{name}</div>
                  <div className="text-[15px] font-medium">
                    {counts[c] > 0 ? totals[c] : '—'}
                    <span className="text-[10px] text-[#aaa]"> /{CAT_MAX[c]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {scores.map((v, i) => v > 0 && (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-lg"
                  style={{ background: SCORE_BG[v], color: SCORE_COL[v] }}
                >
                  {ITEMS[i].name}: {SCORE_LABEL[v]}
                </span>
              ))}
            </div>
            <div className="text-[12px] font-medium">
              総合: {grand}点 / 33点 ｜ {levelLabel}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-2.5 bg-[#1a1a1a] text-white border-none rounded-xl text-[13px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
      >
        {loading ? '保存中...' : 'Notionに保存する'}
      </button>

      {status && (
        <div className={`mt-3 text-[12px] text-center ${status.ok ? 'text-[#085041]' : 'text-[#A32D2D]'}`}>
          {status.msg}
          {status.url && (
            <a
              href={status.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[#378ADD] underline"
            >
              ページを開く →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
