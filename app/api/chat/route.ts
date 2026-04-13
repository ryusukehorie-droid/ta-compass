import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ITEMS } from '@/lib/data'

const ITEM_NAMES = ITEMS.map((it, i) => `${i}: ${it.name}`)

const SYSTEM_PROMPT = `あなたはTA COMPASS（TAチームの採用ヘルスチェックツール）のナレッジDBアシスタントです。

## ナレッジDBの構造

### 診断項目（relatedItemsにはインデックス番号を使用）
${ITEM_NAMES.join('\n')}

### タイプ
- 事例: 企業の具体的な採用事例・取り組み
- 施策・アクション: 採用改善のための施策・アクション
- 参考記事: 採用に関する参考記事・情報
- 独自知見: 実務から得た独自の知見・ノウハウ

### 成熟度レベル（BAD→SOSO→GOOD→EXCの順）
- BAD: 採用体制がほぼない・機能していない状態
- SOSO: 部分的だが不十分な状態
- GOOD: 一定水準で機能している状態
- EXC: 業界トップクラスの採用力がある状態

## あなたの役割
ユーザーのリクエストを解釈し、ナレッジDBへの追加を支援します。
情報が十分な場合はすぐに追加プレビューを出してください。
情報が不足している場合だけ質問してください。

## 応答フォーマット
必ず以下のJSON形式のみで返してください。

追加アクションがある場合:
{"message":"以下の内容で追加します。確認してください。","action":{"type":"add_knowledge","payload":{"title":"タイトル（40文字以内）","type":"事例","body":"本文（300文字以内）","relatedItems":[0,2],"relatedLevels":["EXC"],"company":"会社名","sourceName":"ソース名","sourceUrl":"https://...","tags":["タグ1","タグ2"]}}}

追加アクションがない場合:
{"message":"返答テキスト"}

JSONのみ。説明文・\`\`\`は不要。`

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { message: 'AI機能を使うには ANTHROPIC_API_KEY の設定が必要です。現在は設定されていません。' },
        { status: 200 }
      )
    }

    const { messages } = await req.json()

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('応答を取得できませんでした')
    }

    let parsed
    try {
      const raw = textBlock.text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim()
      parsed = JSON.parse(raw)
    } catch {
      parsed = { message: textBlock.text }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[chat POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
