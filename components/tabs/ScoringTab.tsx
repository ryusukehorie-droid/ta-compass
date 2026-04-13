'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { ITEMS, CATS, getLevelLabel } from '@/lib/data'
import RadarChart from '@/components/RadarChart'
import type { ScoreValue, KnowledgeEntry } from '@/types'

// 4段階 × 11項目 = 44点満点
const CAT_MAX = [8, 20, 8, 8]
const SCORE_LEVEL_MAP = ['', 'BAD', 'SOSO', 'GOOD', 'EXC'] as const

// ヘッダー列定義（値, ラベル, 色）
const SCORE_COLS: { v: ScoreValue; label: string; color: string }[] = [
  { v: 1, label: 'BAD\n1点',  color: '#A32D2D' },
  { v: 2, label: 'SOSO\n2点', color: '#7A5500' },
  { v: 3, label: 'GOOD\n3点', color: '#27500A' },
  { v: 4, label: 'EXC\n4点',  color: '#085041' },
  { v: 0, label: '未評価',    color: '#aaa'    },
]

const COL_TEMPLATE = '2fr 62px 62px 62px 62px 62px'

// ── 関連ナレッジ ───────────────────────────────────────────────────
function RelatedKnowledge({ scores }: { scores: ScoreValue[] }) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(false)

  const weakItems = scores
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v === 1 || v === 2)

  useEffect(() => {
    if (weakItems.length === 0) { setEntries([]); return }
    setLoading(true)
    const targets = weakItems.slice(0, 3)
    Promise.all(
      targets.map(({ i }) =>
        fetch(`/api/knowledge?item=${i}`).then((r) => r.json() as Promise<KnowledgeEntry[]>)
      )
    ).then((results) => {
      const seen = new Set<string>()
      const merged: KnowledgeEntry[] = []
      results.flat().forEach((e) => { if (!seen.has(e.id)) { seen.add(e.id); merged.push(e) } })
      setEntries(merged.slice(0, 6))
    }).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores.join(',')])

  if (weakItems.length === 0) return null

  return (
    <div className="mt-6">
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-2">
        関連ナレッジ（BAD / SOSO 項目）
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {weakItems.map(({ v, i }) => (
          <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${
            v === 1 ? 'bg-[#FCEBEB] text-[#791F1F]' : 'bg-[#FFF3CC] text-[#7A5500]'
          }`}>
            {SCORE_LEVEL_MAP[v]} : {String(i + 1).padStart(2, '0')}. {ITEMS[i].name}
          </span>
        ))}
      </div>
      {loading && <div className="text-[12px] text-[#aaa]">読み込み中...</div>}
      {!loading && entries.length === 0 && (
        <div className="text-[12px] text-[#aaa] bg-[#f7f6f3] rounded-lg px-3 py-2">
          関連ナレッジがまだありません。「ナレッジDB」タブから追加できます。
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map((e) => (
          <div key={e.id} className="border border-[#e8e6e0] rounded-xl p-3 bg-white">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#3C3489]">{e.type}</span>
              {e.company && <span className="text-[9px] text-[#aaa]">{e.company}</span>}
            </div>
            <div className="text-[12px] font-medium mb-1 leading-snug">{e.title}</div>
            <p className="text-[11px] text-[#555] leading-relaxed line-clamp-2">{e.body}</p>
            {e.sourceUrl && (
              <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-1 text-[10px] text-[#378ADD]">
                {e.sourceName ?? 'ソース'} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── メイン ────────────────────────────────────────────────────────
interface Props {
  scores: ScoreValue[]
  onChange: (scores: ScoreValue[]) => void
}

export default function ScoringTab({ scores, onChange }: Props) {
  // 比較モード
  const [showCompare, setShowCompare] = useState(false)
  const [compareScores, setCompareScores] = useState<ScoreValue[]>(
    new Array(ITEMS.length).fill(0) as ScoreValue[]
  )

  const totals: number[] = [0, 0, 0, 0]
  const counts: number[] = [0, 0, 0, 0]
  let grand = 0
  scores.forEach((v, i) => {
    if (v > 0) { totals[ITEMS[i].cat] += v; counts[ITEMS[i].cat]++; grand += v }
  })

  const m1 = scores[0], m2 = scores[1]
  const warn = (m1 === 1 || m2 === 1)

  let levelColor = '#888'
  if (grand > 0) {
    if (grand <= 14) levelColor = '#A32D2D'
    else if (grand <= 22) levelColor = '#7A5500'
    else if (grand <= 30) levelColor = '#534AB7'
    else levelColor = '#0F6E56'
  }

  const setScore = (i: number, v: ScoreValue) => {
    const next = [...scores] as ScoreValue[]
    next[i] = v
    onChange(next)
  }
  const setCompare = (i: number, v: ScoreValue) => {
    const next = [...compareScores] as ScoreValue[]
    next[i] = v
    setCompareScores(next)
  }
  const reset = () => onChange(new Array(ITEMS.length).fill(0) as ScoreValue[])
  const resetCompare = () => setCompareScores(new Array(ITEMS.length).fill(0) as ScoreValue[])

  let prevCat = -1
  const rows: ReactNode[] = []
  ITEMS.forEach((it, i) => {
    if (it.cat !== prevCat) {
      rows.push(
        <div key={`cat-${it.cat}`} className="grid" style={{ gridTemplateColumns: COL_TEMPLATE }}>
          <div className="col-span-6 text-[11px] font-medium tracking-wide text-[#888] px-2 py-1.5 bg-[#f7f6f3] border-b border-[#e8e6e0]">
            {CATS[it.cat]}
          </div>
        </div>
      )
      prevCat = it.cat
    }
    rows.push(
      <div
        key={i}
        className="grid border-b border-[#f0ede8] items-center hover:bg-[#fafaf8]"
        style={{ gridTemplateColumns: COL_TEMPLATE }}
      >
        <div className="px-2 py-1.5 text-[12px] leading-snug">
          <span className="text-[10px] text-[#aaa] mr-1">{String(i + 1).padStart(2, '0')}.</span>
          {it.name}
          <div className="text-[10px] text-[#aaa] mt-0.5">{it.sub}</div>
        </div>
        {SCORE_COLS.map(({ v }) => (
          <div key={v} className="flex justify-center py-1.5">
            <input
              type="radio"
              name={`r${i}`}
              checked={scores[i] === v}
              onChange={() => setScore(i, v)}
              className="w-[15px] h-[15px] cursor-pointer accent-[#534AB7]"
            />
          </div>
        ))}
      </div>
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase">
          スコアリングシート — BAD=1 / SOSO=2 / GOOD=3 / EXCELLENT=4
        </div>
        <button
          onClick={() => setShowCompare(!showCompare)}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
            showCompare
              ? 'bg-[#FFF3E0] text-[#7A3800] border-[#EF9F27]'
              : 'bg-white text-[#888] border-[#e0ddd6] hover:border-[#aaa]'
          }`}
        >
          {showCompare ? '比較モード ON' : '比較モードをON'}
        </button>
      </div>

      {/* 現在スコア ヘッダー */}
      <div className="grid mb-1" style={{ gridTemplateColumns: COL_TEMPLATE }}>
        <div className="text-[11px] font-medium text-[#888] px-2 py-1">診断項目</div>
        {SCORE_COLS.map(({ v, label, color }) => (
          <div key={v} className="text-[11px] font-medium py-1 text-center whitespace-pre-line leading-tight" style={{ color }}>
            {label}
          </div>
        ))}
      </div>

      {rows}

      {/* 比較スコア（beforeテーブル） */}
      {showCompare && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-5 h-0.5 bg-[#EF9F27] rounded" style={{ borderTop: '2px dashed #EF9F27', height: 0 }} />
            <div className="text-[11px] font-medium text-[#7A3800]">比較スコア（以前）</div>
            <button onClick={resetCompare} className="ml-auto text-[10px] text-[#aaa] border border-[#e0ddd6] px-2 py-0.5 rounded cursor-pointer bg-white hover:bg-[#f7f6f3]">リセット</button>
          </div>
          {/* 比較ヘッダー */}
          <div className="grid mb-1" style={{ gridTemplateColumns: COL_TEMPLATE }}>
            <div className="text-[11px] font-medium text-[#aaa] px-2 py-1">診断項目</div>
            {SCORE_COLS.map(({ v, label }) => (
              <div key={v} className="text-[11px] font-medium py-1 text-center whitespace-pre-line leading-tight text-[#aaa]">{label}</div>
            ))}
          </div>
          {/* 比較行 */}
          {ITEMS.map((it, i) => (
            <div key={i} className="grid border-b border-[#f0ede8] items-center hover:bg-[#fffdf5]" style={{ gridTemplateColumns: COL_TEMPLATE }}>
              <div className="px-2 py-1.5 text-[12px] leading-snug text-[#aaa]">
                <span className="text-[10px] mr-1">{String(i + 1).padStart(2, '0')}.</span>{it.name}
              </div>
              {SCORE_COLS.map(({ v }) => (
                <div key={v} className="flex justify-center py-1.5">
                  <input
                    type="radio"
                    name={`cmp${i}`}
                    checked={compareScores[i] === v}
                    onChange={() => setCompare(i, v)}
                    className="w-[15px] h-[15px] cursor-pointer accent-[#EF9F27]"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* スコアサマリー */}
      <div className="mt-4 bg-[#f7f6f3] rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {CATS.map((name, c) => (
            <div key={c} className="bg-white border border-[#e8e6e0] rounded-lg p-2 text-center">
              <div className="text-[10px] text-[#888] mb-0.5">{name}</div>
              <div className="text-[17px] font-medium">{counts[c] > 0 ? totals[c] : '—'}</div>
              <div className="text-[10px] text-[#aaa]">/{CAT_MAX[c]}</div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[#888] mb-1">総合スコア</div>
        <div className="h-2 bg-[#e0ddd6] rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-[#534AB7] rounded-full transition-all duration-300"
            style={{ width: grand ? `${(grand / 44) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#aaa] mb-2">
          <span>0</span><span>11</span><span>22</span><span>33</span><span>44点</span>
        </div>
        <div className="text-[13px] font-medium text-center mb-1" style={{ color: levelColor }}>
          {grand > 0 ? `合計 ${grand}点 / 44点 ｜ ${getLevelLabel(grand)}` : '—'}
        </div>
        {warn && grand > 0 && (
          <div className="text-[11px] text-center text-[#A32D2D]">⚑ 経営アラインメント要注意</div>
        )}
        <button
          onClick={reset}
          className="mt-3 w-full py-1.5 text-[12px] border border-[#ccc] rounded-lg bg-transparent text-[#888] hover:bg-[#f7f6f3] cursor-pointer"
        >
          リセット
        </button>
      </div>

      {/* レーダーチャート */}
      <div className="mt-6">
        <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-3">レーダーチャート</div>
        <div className="flex gap-4 items-center mb-3 text-[11px] text-[#888] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 bg-[#534AB7] rounded" />現在
          </span>
          {showCompare && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6" style={{ borderTop: '2px dashed #EF9F27' }} />以前（比較）
            </span>
          )}
          <span className="text-[#aaa]">— スコアを入力するとチャートが更新されます</span>
        </div>
        <div className="flex justify-center">
          <RadarChart scores={scores} compareScores={showCompare ? compareScores : undefined} />
        </div>
      </div>

      <RelatedKnowledge scores={scores} />
    </div>
  )
}
