'use client'

import { useState } from 'react'

const CARDS = [
  {
    type: '精緻化',
    title: '項目ごとの重み付けを設計する',
    desc: '経営アラインメントやTAカルチャーなど影響度が高い項目に倍点を設けるウェイト設計、ステージ別の重み変動も検討できる。',
    prompt: 'TAレベルヘルスチェックv4の項目ごとの重み付け設計を検討したいです。どの項目が最も採用成果に直結しますか？ステージ別の重み付けも含めて提案してください。',
  },
  {
    type: '活用方法',
    title: '診断レポートフォーマットを作る',
    desc: 'スコアリング結果を投資先にフィードバックするA4一枚の診断レポートを設計する。強み・弱み・優先アクションの3点構成が実用的。',
    prompt: 'TAレベルヘルスチェックv4のスコアリング結果を投資先にフィードバックするための診断レポートフォーマットを設計してください。',
  },
  {
    type: '活用方法',
    title: 'BAD項目別の90日アクションプランを作る',
    desc: '各項目でBADと診断された投資先に対して、次の90日で取れる具体的な改善アクションを項目別に整理する。',
    prompt: 'TAレベルヘルスチェックv4でBADと診断された項目に対して、次の90日で投資先が取れる具体的な改善アクションプランを項目別に設計してください。',
  },
  {
    type: 'ベンチマーク拡充',
    title: 'さらなる先進事例を調査する',
    desc: '国内（メルカリ・SmartHR・freee）や海外（Rippling・Stripe）のTA事例をリサーチし、EXCELLENTの定義をさらに精緻化する。',
    prompt: 'TAレベルヘルスチェックのEXCELLENT基準をさらに精緻化するために、メルカリ・SmartHR・freee・Rippling・Stripeなど先進的なTA事例をリサーチしてください。',
  },
  {
    type: '検証',
    title: '投資先でパイロット診断を行う',
    desc: '1〜2社の投資先でヒアリングを実施し、設問の解像度・スコアの妥当性・対話の流れを検証する。',
    prompt: 'TAレベルヘルスチェックv4のパイロット診断を投資先1社で実施したいと思います。ヒアリング前の準備物リスト、当日の進め方、結果の整理方法をガイド形式でまとめてください。',
  },
  {
    type: '活用方法',
    title: 'ヒアリング設問を面談ガイドに仕上げる',
    desc: '33問を投資先との30〜60分の面談で使えるインタビューガイド形式に整理する。オープニング・コア・クロージングの流れで設計する。',
    prompt: 'TAレベルヘルスチェックv4のヒアリング設問33問を、投資先との30〜60分の面談で実際に使えるインタビューガイド形式に仕上げてください。',
  },
]

export default function NextTab() {
  const [copied, setCopied] = useState<number | null>(null)

  const copy = async (idx: number, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="bg-[#f7f6f3] rounded-lg px-4 py-3 text-[12px] text-[#555] leading-relaxed mb-5">
        このフレームワークをさらに発展させるために考えられる次のアジェンダです。
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CARDS.map((c, i) => (
          <div key={i} className="border border-[#e8e6e0] rounded-xl p-4 bg-white">
            <div className="text-[10px] font-medium text-[#888] uppercase tracking-wide mb-1">{c.type}</div>
            <div className="text-[13px] font-medium mb-1.5 leading-snug">{c.title}</div>
            <p className="text-[11px] text-[#888] leading-relaxed mb-3">{c.desc}</p>
            <button
              onClick={() => copy(i, c.prompt)}
              className="text-[11px] cursor-pointer px-2.5 py-1.5 border border-[#ccc] rounded-lg bg-transparent text-[#888] hover:bg-[#f7f6f3] w-full transition-colors"
            >
              {copied === i ? '✓ コピー済み' : 'プロンプトをコピー ↗'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
