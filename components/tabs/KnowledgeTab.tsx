'use client'

import { useState, useEffect, useCallback } from 'react'
import { ITEMS, CATS } from '@/lib/data'
import Pill from '@/components/Pill'
import type { KnowledgeEntry, KnowledgeCreatePayload, KnowledgeType, DiagLevel } from '@/types'

// ── 定数 ───────────────────────────────────────────────────────────
const TYPES: KnowledgeType[] = ['事例', '施策・アクション', '参考記事', '独自知見']
const LEVELS: DiagLevel[] = ['BAD', 'SOSO', 'GOOD', 'EXC']

const TYPE_STYLE: Record<KnowledgeType, string> = {
  '事例':         'bg-[#EEEDFE] text-[#3C3489]',
  '施策・アクション': 'bg-[#EAF3DE] text-[#27500A]',
  '参考記事':     'bg-[#E6F1FB] text-[#0C447C]',
  '独自知見':     'bg-[#FFF0E0] text-[#7A3800]',
}

const LEVEL_STYLE: Record<DiagLevel, string> = {
  BAD:  'bg-[#FCEBEB] text-[#791F1F]',
  SOSO: 'bg-[#FFF3CC] text-[#7A5500]',
  GOOD: 'bg-[#EAF3DE] text-[#27500A]',
  EXC:  'bg-[#E1F5EE] text-[#085041]',
}

// ── カード ─────────────────────────────────────────────────────────
function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-[#e8e6e0] rounded-xl bg-white overflow-hidden">
      <div className="px-4 py-3">
        {/* header row */}
        <div className="flex items-start gap-2 mb-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg shrink-0 ${TYPE_STYLE[entry.type]}`}>
            {entry.type}
          </span>
          {entry.company && (
            <span className="text-[10px] text-[#888] border border-[#e8e6e0] px-1.5 py-0.5 rounded-lg shrink-0">
              {entry.company}
            </span>
          )}
        </div>

        {/* title */}
        <div className="text-[13px] font-medium leading-snug mb-2">{entry.title}</div>

        {/* body (collapsible) */}
        <p className={`text-[11px] text-[#555] leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {entry.body}
        </p>
        {entry.body.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-[#378ADD] mt-1 cursor-pointer bg-transparent border-none p-0"
          >
            {expanded ? '折りたたむ' : '続きを読む'}
          </button>
        )}

        {/* related items */}
        {entry.relatedItems.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.relatedItems.map((idx) => (
              <Pill key={idx} cat={ITEMS[idx].cat} label={ITEMS[idx].name} small />
            ))}
          </div>
        )}

        {/* levels */}
        {entry.relatedLevels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {entry.relatedLevels.map((lv) => (
              <span key={lv} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${LEVEL_STYLE[lv]}`}>
                {lv}
              </span>
            ))}
          </div>
        )}

        {/* tags + source */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {entry.tags.map((t) => (
            <span key={t} className="text-[9px] text-[#aaa] border border-[#e8e6e0] px-1.5 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
          {entry.sourceUrl ? (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[10px] text-[#378ADD] border border-[#c8dff5] px-1.5 py-0.5 rounded-lg bg-[#F0F7FF] hover:bg-[#deeeff] shrink-0"
            >
              {entry.sourceName ?? 'ソース'}
            </a>
          ) : entry.sourceName ? (
            <span className="ml-auto text-[10px] text-[#aaa] border border-[#e8e6e0] px-1.5 py-0.5 rounded-lg bg-[#f7f6f3] shrink-0">
              {entry.sourceName}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── 追加フォーム ───────────────────────────────────────────────────
function AddForm({ onAdded }: { onAdded: (entry: KnowledgeEntry) => void }) {
  const empty: KnowledgeCreatePayload = {
    title: '', type: '独自知見', body: '',
    relatedItems: [], relatedLevels: [],
    company: '', sourceName: '', sourceUrl: '', tags: [],
  }
  const [form, setForm] = useState<KnowledgeCreatePayload>(empty)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // AI自動入力
  const [pasteText, setPasteText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/knowledge/parse')
      .then((r) => r.json())
      .then((j) => setAiAvailable(!!j.available))
      .catch(() => setAiAvailable(false))
  }, [])

  const set = <K extends keyof KnowledgeCreatePayload>(k: K, v: KnowledgeCreatePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleAutoParse = async () => {
    if (!pasteText.trim()) { setParseError('テキストを入力してください'); return }
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/knowledge/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      // フォームを自動入力（タグ入力欄はリセット）
      setForm({
        title:         json.title         ?? '',
        type:          json.type          ?? '独自知見',
        body:          json.body          ?? '',
        relatedItems:  json.relatedItems  ?? [],
        relatedLevels: json.relatedLevels ?? [],
        company:       json.company       ?? '',
        sourceName:    json.sourceName    ?? '',
        sourceUrl:     json.sourceUrl     ?? '',
        tags:          json.tags          ?? [],
      })
      setTagInput('')
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e))
    } finally {
      setParsing(false)
    }
  }

  const toggleItem = (i: number) =>
    set('relatedItems', form.relatedItems.includes(i)
      ? form.relatedItems.filter((x) => x !== i)
      : [...form.relatedItems, i])

  const toggleLevel = (lv: DiagLevel) =>
    set('relatedLevels', form.relatedLevels.includes(lv)
      ? form.relatedLevels.filter((x) => x !== lv)
      : [...form.relatedLevels, lv])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  const handleSave = async () => {
    setError('')
    if (!form.title.trim()) { setError('タイトルは必須です'); return }
    if (!form.body.trim())  { setError('本文は必須です'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      onAdded(json)
      setForm(empty)
      setTagInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7]'

  return (
    <div className="border border-[#534AB7] border-dashed rounded-xl p-4 bg-[#FAFAFE] mb-4">
      <div className="text-[11px] font-medium text-[#534AB7] uppercase tracking-wide mb-3">+ ナレッジを追加</div>

      {/* ── Step 1: AI自動入力 ── */}
      <div className={`border rounded-xl p-3 mb-4 ${aiAvailable ? 'bg-white border-[#e8e6e0]' : 'bg-[#f7f6f3] border-[#e0ddd6]'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-medium ${aiAvailable ? 'text-[#534AB7]' : 'text-[#aaa]'}`}>✨ AIで自動入力</span>
          {aiAvailable === false && (
            <span className="text-[10px] text-[#aaa]">（未設定 — 下のフォームで手動入力できます）</span>
          )}
          {aiAvailable === true && (
            <span className="text-[10px] text-[#aaa]">テキストを貼り付けると項目を自動で埋めます</span>
          )}
        </div>

        {aiAvailable === false ? (
          <div className="text-[11px] text-[#888] bg-white border border-[#e0ddd6] rounded-lg px-3 py-2.5 leading-relaxed">
            AI自動入力を使うには <code className="bg-[#f0ede8] px-1 rounded text-[10px]">ANTHROPIC_API_KEY</code> の設定が必要です。<br />
            キーは <span className="text-[#378ADD]">console.anthropic.com</span> で取得して
            <code className="bg-[#f0ede8] px-1 rounded text-[10px] ml-1">.env.local</code> に追加してください。<br />
            <span className="text-[#aaa]">現在は下の入力フォームから手動で登録できます。</span>
          </div>
        ) : (
          <>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={!aiAvailable}
              className="w-full px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7] resize-y leading-relaxed mb-2 disabled:bg-[#f7f6f3]"
              placeholder="メモ・記事・事例などのテキストをここに貼り付けてください..."
            />
            {parseError && (
              <div className="text-[11px] text-[#A32D2D] mb-2">⚠ {parseError}</div>
            )}
            <button
              type="button"
              onClick={handleAutoParse}
              disabled={parsing || !pasteText.trim()}
              className="px-4 py-1.5 bg-[#534AB7] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer disabled:opacity-40 hover:bg-[#3f37a0] transition-colors"
            >
              {parsing ? '解析中...' : '✨ 自動入力する'}
            </button>
            <span className="text-[10px] text-[#aaa] ml-2">（内容を確認・編集してから保存してください）</span>
          </>
        )}
      </div>

      {/* ── Step 2: フォーム入力 ── */}
      <div className="text-[10px] font-medium text-[#888] uppercase tracking-wide mb-2.5">内容を確認・編集</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
        {/* タイトル */}
        <div className="sm:col-span-2">
          <div className="text-[11px] text-[#888] mb-1">タイトル *</div>
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="例：リファラル採用の活性化施策" />
        </div>

        {/* タイプ */}
        <div>
          <div className="text-[11px] text-[#888] mb-1">タイプ *</div>
          <select className={`${inputCls} bg-white`} value={form.type}
            onChange={(e) => set('type', e.target.value as KnowledgeType)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* 会社名 */}
        <div>
          <div className="text-[11px] text-[#888] mb-1">会社名（任意）</div>
          <input className={inputCls} value={form.company ?? ''} onChange={(e) => set('company', e.target.value)}
            placeholder="例：LayerX" />
        </div>
      </div>

      {/* 本文 */}
      <div className="mb-2.5">
        <div className="text-[11px] text-[#888] mb-1">本文 *</div>
        <textarea rows={4} className={`${inputCls} resize-y leading-relaxed`}
          value={form.body} onChange={(e) => set('body', e.target.value)}
          placeholder="具体的な施策内容、事例の詳細、知見など" />
      </div>

      {/* 診断項目（複数選択） */}
      <div className="mb-2.5">
        <div className="text-[11px] text-[#888] mb-1.5">関連する診断項目（複数選択可）</div>
        <div className="flex flex-wrap gap-1.5">
          {ITEMS.map((it, i) => (
            <button key={i} type="button" onClick={() => toggleItem(i)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                form.relatedItems.includes(i)
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#888] border-[#e0ddd6] hover:border-[#aaa]'
              }`}>
              {it.name}
            </button>
          ))}
        </div>
      </div>

      {/* 対象レベル */}
      <div className="mb-2.5">
        <div className="text-[11px] text-[#888] mb-1.5">対象レベル（複数選択可）</div>
        <div className="flex gap-1.5 flex-wrap">
          {LEVELS.map((lv) => (
            <button key={lv} type="button" onClick={() => toggleLevel(lv)}
              className={`text-[11px] font-medium px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                form.relatedLevels.includes(lv)
                  ? `${LEVEL_STYLE[lv]} border-current`
                  : 'bg-white text-[#888] border-[#e0ddd6] hover:border-[#aaa]'
              }`}>
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* ソース */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
        <div>
          <div className="text-[11px] text-[#888] mb-1">ソース名（任意）</div>
          <input className={inputCls} value={form.sourceName ?? ''} onChange={(e) => set('sourceName', e.target.value)}
            placeholder="例：LayerX note" />
        </div>
        <div>
          <div className="text-[11px] text-[#888] mb-1">URL（任意）</div>
          <input className={inputCls} value={form.sourceUrl ?? ''} onChange={(e) => set('sourceUrl', e.target.value)}
            placeholder="https://..." type="url" />
        </div>
      </div>

      {/* タグ */}
      <div className="mb-3">
        <div className="text-[11px] text-[#888] mb-1">タグ</div>
        <div className="flex gap-1.5 items-center">
          <input className={`${inputCls} flex-1`} value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="タグを入力してEnter" />
          <button type="button" onClick={addTag}
            className="px-3 py-1.5 text-[12px] border border-[#ccc] rounded-lg bg-white text-[#888] hover:bg-[#f7f6f3] cursor-pointer">
            追加
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {form.tags.map((t) => (
              <span key={t} className="text-[10px] text-[#aaa] border border-[#e8e6e0] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                #{t}
                <button onClick={() => set('tags', form.tags.filter((x) => x !== t))}
                  className="text-[#ccc] hover:text-[#888] cursor-pointer bg-transparent border-none p-0 leading-none">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-[11px] text-[#A32D2D] mb-2">{error}</div>}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-2 bg-[#534AB7] text-white border-none rounded-xl text-[12px] font-medium cursor-pointer disabled:opacity-50 hover:bg-[#3f37a0] transition-colors">
        {saving ? '保存中...' : 'Notionに保存する'}
      </button>
    </div>
  )
}

// ── メインタブ ─────────────────────────────────────────────────────
export default function KnowledgeTab() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // フィルタ
  const [typeFilter,  setTypeFilter]  = useState<KnowledgeType | 'all'>('all')
  const [catFilter,   setCatFilter]   = useState<number | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<DiagLevel | 'all'>('all')
  const [search,      setSearch]      = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const params = new URLSearchParams()
      if (catFilter   !== 'all') params.set('item',  String(catFilter))
      if (levelFilter !== 'all') params.set('level', levelFilter)
      if (typeFilter  !== 'all') params.set('type',  typeFilter)
      const res = await fetch(`/api/knowledge?${params}`)
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? res.statusText)
      }
      setEntries(await res.json())
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [typeFilter, catFilter, levelFilter])

  useEffect(() => { load() }, [load])

  // クライアントサイドの検索絞り込み
  const filtered = entries.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.title.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (e.company?.toLowerCase().includes(q) ?? false)
    )
  })

  const handleAdded = (entry: KnowledgeEntry) => {
    setEntries((prev) => [entry, ...prev])
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase">
          ナレッジDB — レイヤー2
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
            showForm
              ? 'bg-[#f7f6f3] text-[#888] border-[#ccc]'
              : 'bg-[#534AB7] text-white border-[#534AB7] hover:bg-[#3f37a0]'
          }`}
        >
          {showForm ? '閉じる' : '+ 追加'}
        </button>
      </div>
      <p className="text-[12px] text-[#888] mb-4">
        事例・施策・記事・独自知見を蓄積し、診断項目・成熟度レベルと紐づけて管理します。
      </p>

      {showForm && <AddForm onAdded={handleAdded} />}

      {/* フィルターバー */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {/* テキスト検索 */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="キーワード検索..."
          className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7] w-36"
        />

        {/* タイプ */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as KnowledgeType | 'all')}
          className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] bg-white outline-none focus:border-[#534AB7]"
        >
          <option value="all">タイプ: 全て</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* レベル */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as DiagLevel | 'all')}
          className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] bg-white outline-none focus:border-[#534AB7]"
        >
          <option value="all">レベル: 全て</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* 診断項目（カテゴリ絞り込み） */}
        <select
          value={catFilter === 'all' ? 'all' : String(catFilter)}
          onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] bg-white outline-none focus:border-[#534AB7]"
        >
          <option value="all">診断項目: 全て</option>
          {ITEMS.map((it, i) => <option key={i} value={i}>{it.name}</option>)}
        </select>

        <button
          onClick={load}
          className="px-2.5 py-1.5 text-[12px] border border-[#e0ddd6] rounded-lg bg-white text-[#888] hover:bg-[#f7f6f3] cursor-pointer"
        >
          更新
        </button>

        <span className="text-[11px] text-[#aaa] ml-auto">
          {loading ? '読み込み中...' : `${filtered.length}件`}
        </span>
      </div>

      {/* エラー */}
      {fetchError && (
        <div className="text-[12px] text-[#A32D2D] bg-[#FCEBEB] rounded-lg px-3 py-2 mb-3">
          ⚠ {fetchError}
        </div>
      )}

      {/* カード一覧 */}
      {!loading && filtered.length === 0 && !fetchError && (
        <div className="text-center py-12 text-[#aaa] text-[12px]">
          <div className="text-3xl mb-2">📭</div>
          <div>まだナレッジがありません。「+ 追加」から最初のナレッジを追加してください。</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((e) => <KnowledgeCard key={e.id} entry={e} />)}
      </div>
    </div>
  )
}
