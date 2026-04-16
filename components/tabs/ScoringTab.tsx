'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ITEMS, CATS, getLevelLabel } from '@/lib/data'
import RadarChart from '@/components/RadarChart'
import { saveResult } from '@/lib/history'
import type { ScoreValue, KnowledgeEntry, SavedResult } from '@/types'

// 4段階 × 11項目 = 44点満点
const CAT_MAX = [8, 12, 12, 12]
const SCORE_LEVEL_MAP = ['', 'Entry', 'Developing', 'Standard', 'Excellent'] as const

// ヘッダー列定義（値, ラベル, 色）
const SCORE_COLS: { v: ScoreValue; label: string; color: string }[] = [
  { v: 1, label: 'Entry\n1点',      color: '#A32D2D' },
  { v: 2, label: 'Developing\n2点', color: '#7A5500' },
  { v: 3, label: 'Standard\n3点',   color: '#27500A' },
  { v: 4, label: 'Excellent\n4点',  color: '#085041' },
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
        関連ナレッジ（Entry / Developing 項目）
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

// 成熟度詳細パネル
const MATURITY_LEVELS = [
  { key: 'bad',  label: 'Entry',      bg: '#FCEBEB', color: '#791F1F', score: 1 },
  { key: 'soso', label: 'Developing', bg: '#FFF3CC', color: '#7A5500', score: 2 },
  { key: 'good', label: 'Standard',   bg: '#EAF3DE', color: '#27500A', score: 3 },
  { key: 'exc',  label: 'Excellent',  bg: '#E1F5EE', color: '#085041', score: 4 },
] as const

function MaturityDetail({ item, currentScore }: { item: typeof ITEMS[0]; currentScore: ScoreValue }) {
  return (
    <div className="col-span-6 bg-[#fafaf8] border-b border-[#e8e6e0] px-3 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MATURITY_LEVELS.map(({ key, label, bg, color, score }) => {
          const isSelected = currentScore === score
          return (
            <div
              key={key}
              className="rounded-lg p-2.5 text-[11px] leading-snug border transition-all"
              style={{
                background: bg,
                color,
                borderColor: isSelected ? color : 'transparent',
                boxShadow: isSelected ? `0 0 0 1.5px ${color}` : 'none',
                opacity: currentScore > 0 && !isSelected ? 0.55 : 1,
              }}
            >
              <span className="font-bold text-[10px] block mb-0.5">
                {isSelected ? `▶ ${label}（現在）` : label}
              </span>
              {item[key]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── メイン ────────────────────────────────────────────────────────
interface Props {
  scores: ScoreValue[]
  onChange: (scores: ScoreValue[]) => void
  toLoad?: { key: string; result: SavedResult } | null
}

export default function ScoringTab({ scores, onChange, toLoad }: Props) {
  // 会社名・日付
  const today = new Date().toISOString().slice(0, 10)
  const [company, setCompany] = useState('')
  const [date, setDate] = useState(today)

  // 保存ステータス
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const saveMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 展開中の項目
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  // 外部から読み込んだ結果を反映
  useEffect(() => {
    if (!toLoad) return
    setCompany(toLoad.result.company)
    setDate(toLoad.result.date)
    onChange(toLoad.result.scores as ScoreValue[])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toLoad?.key])

  // 比較モード
  const [showCompare, setShowCompare] = useState(false)
  const [compareScores, setCompareScores] = useState<ScoreValue[]>(
    new Array(ITEMS.length).fill(0) as ScoreValue[]
  )
  const [compareCompany, setCompareCompany] = useState('')
  const [compareDate, setCompareDate] = useState(today)

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

  const handleSave = () => {
    if (!grand) {
      setSaveMsg('⚠ スコアを入力してから保存してください')
      return
    }
    const result: SavedResult = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      company: company.trim() || '（会社名なし）',
      date: date || today,
      scores: [...scores] as ScoreValue[],
      grand,
      level: getLevelLabel(grand),
      catTotals: [totals[0], totals[1], totals[2], totals[3]],
      savedAt: new Date().toISOString(),
    }
    saveResult(result)
    setSaveMsg('✓ 保存しました')
    if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current)
    saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 3000)
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

  const toggleExpand = (i: number) => setExpandedItem(expandedItem === i ? null : i)

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
    const isOpen = expandedItem === i
    rows.push(
      <div key={i} className="grid border-b border-[#f0ede8]" style={{ gridTemplateColumns: COL_TEMPLATE }}>
        {/* 項目名（クリックで展開） */}
        <div
          className="px-2 py-1.5 text-[12px] leading-snug cursor-pointer hover:bg-[#f0effe] select-none flex items-start gap-1"
          onClick={() => toggleExpand(i)}
        >
          <span className="text-[10px] text-[#aaa] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
          <span className="flex-1">
            {it.name}
            <div className="text-[10px] text-[#aaa] mt-0.5">{it.sub}</div>
          </span>
          <span className="text-[10px] text-[#bbb] mt-0.5 shrink-0 ml-1">{isOpen ? '▲' : '▼'}</span>
        </div>
        {SCORE_COLS.map(({ v }) => (
          <div key={v} className="flex justify-center py-1.5 items-center">
            <input
              type="radio"
              name={`r${i}`}
              checked={scores[i] === v}
              onChange={() => setScore(i, v)}
              className="w-[15px] h-[15px] cursor-pointer accent-[#534AB7]"
            />
          </div>
        ))}
        {/* 展開パネル */}
        {isOpen && <MaturityDetail item={it} currentScore={scores[i]} />}
      </div>
    )
  })

  return (
    <div>
      {/* 会社名・日付 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[160px]">
          <div className="text-[10px] text-[#aaa] mb-1">会社名</div>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="例：株式会社〇〇"
            className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7]"
          />
        </div>
        <div>
          <div className="text-[10px] text-[#aaa] mb-1">スコアリング日</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7] bg-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase">
          スコアリングシート — Entry=1 / Developing=2 / Standard=3 / Excellent=4
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
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-5" style={{ borderTop: '2px dashed #EF9F27', height: 0 }} />
            <div className="text-[11px] font-medium text-[#7A3800]">比較スコア（以前）</div>
            <button onClick={resetCompare} className="ml-auto text-[10px] text-[#aaa] border border-[#e0ddd6] px-2 py-0.5 rounded cursor-pointer bg-white hover:bg-[#f7f6f3]">リセット</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex-1 min-w-[160px]">
              <div className="text-[10px] text-[#aaa] mb-1">会社名（比較）</div>
              <input
                value={compareCompany}
                onChange={(e) => setCompareCompany(e.target.value)}
                placeholder="例：株式会社〇〇"
                className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#EF9F27]"
              />
            </div>
            <div>
              <div className="text-[10px] text-[#aaa] mb-1">スコアリング日（比較）</div>
              <input
                type="date"
                value={compareDate}
                onChange={(e) => setCompareDate(e.target.value)}
                className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#EF9F27] bg-white"
              />
            </div>
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
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-1.5 text-[12px] font-medium bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] cursor-pointer transition-colors"
          >
            この結果を保存
          </button>
          <button
            onClick={reset}
            className="px-4 py-1.5 text-[12px] border border-[#ccc] rounded-lg bg-transparent text-[#888] hover:bg-[#f7f6f3] cursor-pointer"
          >
            リセット
          </button>
        </div>
        {saveMsg && (
          <div className={`mt-2 text-[12px] text-center font-medium ${saveMsg.startsWith('✓') ? 'text-[#0F6E56]' : 'text-[#A32D2D]'}`}>
            {saveMsg}
          </div>
        )}
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
          <RadarChart
            scores={scores}
            company={company || undefined}
            date={date || undefined}
            compareScores={showCompare ? compareScores : undefined}
            compareCompany={showCompare ? (compareCompany || undefined) : undefined}
            compareDate={showCompare ? (compareDate || undefined) : undefined}
          />
        </div>
      </div>

      <RelatedKnowledge scores={scores} />
    </div>
  )
}
