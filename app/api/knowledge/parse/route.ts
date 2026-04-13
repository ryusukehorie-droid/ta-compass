import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ITEMS } from '@/lib/data'
import type { KnowledgeCreatePayload, KnowledgeType, DiagLevel } from '@/types'

const KNOWLEDGE_TYPES: KnowledgeType[] = ['事例', '施策・アクション', '参考記事', '独自知見']
const DIAG_LEVELS: DiagLevel[] = ['BAD', 'SOSO', 'GOOD', 'EXC']
const ITEM_NAMES = ITEMS.map((it, i) => `${i}: ${it.name}`)

const SYSTEM_PROMPT = `あなたはTAチームの採用ヘルスチェックツール用のナレッジ整理アシスタントです。
ユーザーが貼り付けたテキスト（メモ・記事・事例など）を分析し、以下のJSONフォーマットで構造化してください。

## 診断項目一覧（relatedItemsにはインデックス番号を使用）
${ITEM_NAMES.join('\n')}

## タイプ選択肢
- 事例: 企業の具体的な採用事例・取り組み
- 施策・アクション: 採用改善のための具体的な施策・アクションプラン
- 参考記事: 採用に関する参考になる記事・情報
- 独自知見: 実務から得た独自の知見・ノウハウ

## レベル選択肢（BAD→SOSO→GOOD→EXCの成熟度）
- BAD: 採用体制がほぼない・機能していない状態に関するもの
- SOSO: 部分的に取り組んでいるが不十分な状態に関するもの
- GOOD: 一定水準で機能している状態に関するもの
- EXC: 業界トップクラスの採用力がある状態に関するもの

## 出力フォーマット（必ずこのJSONのみを返してください）
{
  "title": "簡潔なタイトル（40文字以内）",
  "type": "事例|施策・アクション|参考記事|独自知見",
  "body": "本文の要約・整理（300文字以内）",
  "relatedItems": [関連する診断項目のインデックス番号の配列],
  "relatedLevels": ["BAD"|"SOSO"|"GOOD"|"EXC" の配列],
  "company": "会社名（わかる場合のみ、なければ空文字）",
  "sourceName": "ソース名・メディア名（わかる場合のみ、なければ空文字）",
  "sourceUrl": "URL（テキスト中にあれば抽出、なければ空文字）",
  "tags": ["関連キーワードのタグ配列（3〜5個）"]
}

JSONのみを返してください。前後に説明文や\`\`\`は不要です。`

// GET /api/knowledge/parse — AI機能の有効/無効を返す
export async function GET() {
  return NextResponse.json({ available: !!process.env.ANTHROPIC_API_KEY })
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'テキストが空です' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下のテキストを構造化してください:\n\n${text.slice(0, 8000)}`,
        },
      ],
    })

    // テキストブロックを抽出
    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AIからの応答が取得できませんでした' }, { status: 500 })
    }

    // JSON をパース
    let parsed: KnowledgeCreatePayload
    try {
      // コードブロックが混入している場合を除去
      const raw = textBlock.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: `JSONパースに失敗しました: ${textBlock.text.slice(0, 200)}` }, { status: 500 })
    }

    // バリデーション・サニタイズ
    const payload: KnowledgeCreatePayload = {
      title:         String(parsed.title ?? '').slice(0, 100),
      type:          KNOWLEDGE_TYPES.includes(parsed.type) ? parsed.type : '独自知見',
      body:          String(parsed.body ?? '').slice(0, 2000),
      relatedItems:  (parsed.relatedItems ?? []).filter((i: unknown) => typeof i === 'number' && i >= 0 && i < ITEMS.length),
      relatedLevels: (parsed.relatedLevels ?? []).filter((l: unknown) => DIAG_LEVELS.includes(l as DiagLevel)) as DiagLevel[],
      company:       String(parsed.company ?? '') || undefined,
      sourceName:    String(parsed.sourceName ?? '') || undefined,
      sourceUrl:     String(parsed.sourceUrl ?? '') || undefined,
      tags:          (parsed.tags ?? []).map((t: unknown) => String(t)).filter(Boolean).slice(0, 10),
    }

    return NextResponse.json(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[knowledge/parse POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
