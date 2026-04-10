'use client'

import { useState, useRef, useEffect } from 'react'
import { ITEMS } from '@/lib/data'
import type { KnowledgeCreatePayload } from '@/types'

// ── 型定義 ─────────────────────────────────────────────────────────
type ActionStatus = 'pending' | 'saved' | 'dismissed'

type DisplayMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  action?: {
    payload: KnowledgeCreatePayload
    status: ActionStatus
  }
}

type ApiMessage = {
  role: 'user' | 'assistant'
  content: string
}

// ── プレビューカード ───────────────────────────────────────────────
function ActionCard({
  payload,
  status,
  onSave,
  onDismiss,
}: {
  payload: KnowledgeCreatePayload
  status: ActionStatus
  onSave: () => void
  onDismiss: () => void
}) {
  return (
    <div className="mt-2 border border-[#e8e6e0] rounded-xl bg-white overflow-hidden text-[11px]">
      <div className="bg-[#f7f6f3] px-3 py-2 border-b border-[#e8e6e0] font-medium text-[#444]">
        📋 追加内容のプレビュー
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div><span className="text-[#aaa]">タイトル: </span><span className="font-medium">{payload.title}</span></div>
        <div><span className="text-[#aaa]">タイプ: </span>{payload.type}</div>
        {payload.company && <div><span className="text-[#aaa]">会社: </span>{payload.company}</div>}
        <p className="text-[#555] leading-relaxed">{payload.body}</p>
        {payload.relatedItems.length > 0 && (
          <div>
            <span className="text-[#aaa]">関連項目: </span>
            {payload.relatedItems.map((i) => ITEMS[i]?.name).filter(Boolean).join('、')}
          </div>
        )}
        {payload.relatedLevels.length > 0 && (
          <div><span className="text-[#aaa]">レベル: </span>{payload.relatedLevels.join('、')}</div>
        )}
        {payload.tags.length > 0 && (
          <div><span className="text-[#aaa]">タグ: </span>{payload.tags.map((t) => `#${t}`).join(' ')}</div>
        )}
      </div>

      {status === 'pending' && (
        <div className="px-3 py-2 border-t border-[#e8e6e0] flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 py-1.5 bg-[#534AB7] text-white rounded-lg text-[11px] font-medium cursor-pointer hover:bg-[#3f37a0] transition-colors border-none"
          >
            ✓ ナレッジDBに追加する
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 border border-[#e0ddd6] rounded-lg text-[11px] text-[#888] cursor-pointer hover:bg-[#f7f6f3] transition-colors bg-white"
          >
            キャンセル
          </button>
        </div>
      )}
      {status === 'saved' && (
        <div className="px-3 py-2 border-t border-[#e8e6e0] text-[11px] text-[#27500A] bg-[#EAF3DE]">
          ✓ ナレッジDBに保存しました
        </div>
      )}
      {status === 'dismissed' && (
        <div className="px-3 py-2 border-t border-[#e8e6e0] text-[11px] text-[#aaa]">
          キャンセルしました
        </div>
      )}
    </div>
  )
}

// ── メインコンポーネント ───────────────────────────────────────────
export default function ChatPanel() {
  const [open, setOpen] = useState(false)
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'こんにちは！ナレッジDBの管理をお手伝いします。\n\n例：\n・「LayerXのリファラル採用事例を追加して」\n・「スカウト返信率を上げる施策を追加したい」',
    },
  ])
  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [displayMessages, open])

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: DisplayMessage = { id: `u-${Date.now()}`, role: 'user', text }
    const userApiMsg: ApiMessage = { role: 'user', content: text }
    setDisplayMessages((prev) => [...prev, userMsg])

    const newApiMessages = [...apiMessages, userApiMsg]
    setApiMessages(newApiMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)

      const assistantMsg: DisplayMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: json.message ?? '応答を取得できませんでした',
        action:
          json.action?.type === 'add_knowledge'
            ? { payload: json.action.payload, status: 'pending' }
            : undefined,
      }

      setDisplayMessages((prev) => [...prev, assistantMsg])
      setApiMessages((prev) => [...prev, { role: 'assistant', content: JSON.stringify(json) }])
    } catch (e) {
      setDisplayMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `エラー: ${e instanceof Error ? e.message : String(e)}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (msgId: string, payload: KnowledgeCreatePayload) => {
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? res.statusText)
      }
      setDisplayMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.action ? { ...m, action: { ...m.action, status: 'saved' } } : m
        )
      )
    } catch (e) {
      alert(`保存に失敗しました: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleDismiss = (msgId: string) => {
    setDisplayMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.action ? { ...m, action: { ...m.action, status: 'dismissed' } } : m
      )
    )
  }

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 w-13 h-13 rounded-full shadow-xl flex items-center justify-center cursor-pointer border-none transition-all z-50 ${
          open ? 'bg-[#1a1a1a]' : 'bg-[#534AB7] hover:bg-[#3f37a0]'
        }`}
        style={{ width: 52, height: 52 }}
        title="ナレッジDBアシスタント"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="3" y1="3" x2="13" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="3" x2="3" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V12C17 12.5523 16.5523 13 16 13H11L7 17V13H4C3.44772 13 3 12.5523 3 12V4Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* チャットパネル */}
      {open && (
        <div
          className="fixed bottom-20 right-5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#e8e6e0] flex flex-col z-50 overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          {/* ヘッダー */}
          <div className="px-4 py-3 bg-[#534AB7] text-white flex items-center gap-2 shrink-0">
            <div className="text-[13px] font-medium">ナレッジDB アシスタント</div>
            <div className="text-[10px] text-[#c4bfff] ml-auto">powered by Claude</div>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`${msg.role === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#1a1a1a] text-white rounded-br-sm'
                        : 'bg-[#f7f6f3] text-[#333] rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.action && (
                    <ActionCard
                      payload={msg.action.payload}
                      status={msg.action.status}
                      onSave={() => handleSave(msg.id, msg.action!.payload)}
                      onDismiss={() => handleDismiss(msg.id)}
                    />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#f7f6f3] px-3 py-2 rounded-xl rounded-bl-sm text-[12px] text-[#aaa]">
                  考え中...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 入力エリア */}
          <div className="px-3 py-3 border-t border-[#e8e6e0] shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="例：LayerXのリファラル採用事例を追加して"
                className="flex-1 px-2.5 py-1.5 border border-[#e0ddd6] rounded-lg text-[12px] outline-none focus:border-[#534AB7] resize-none leading-relaxed"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-[#534AB7] text-white rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-40 hover:bg-[#3f37a0] transition-colors border-none self-end"
              >
                送信
              </button>
            </div>
            <div className="text-[10px] text-[#ccc] mt-1">Shift+Enter で改行</div>
          </div>
        </div>
      )}
    </>
  )
}
