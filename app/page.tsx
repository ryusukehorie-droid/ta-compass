'use client'

import { useState } from 'react'
import { ITEMS } from '@/lib/data'
import type { ScoreValue } from '@/types'

import OverviewTab   from '@/components/tabs/OverviewTab'
import MaturityTab   from '@/components/tabs/MaturityTab'
import CasesTab      from '@/components/tabs/CasesTab'
import ScoringTab    from '@/components/tabs/ScoringTab'
import StageTab      from '@/components/tabs/StageTab'
import HearingTab    from '@/components/tabs/HearingTab'
import KnowledgeTab  from '@/components/tabs/KnowledgeTab'
import NotionTab     from '@/components/tabs/NotionTab'
import NextTab       from '@/components/tabs/NextTab'

const TABS = [
  '1. 全体像',
  '2. 成熟度マップ',
  '3. 事例集',
  '4. スコアリング',
  '5. ステージ別基準',
  '6. ヒアリング設問',
  '📚 ナレッジDB',
  '💾 Notionに保存',
  '7. 次の問い',
]

export default function Home() {
  const [tab, setTab] = useState(0)
  const [scores, setScores] = useState<ScoreValue[]>(
    new Array(ITEMS.length).fill(0) as ScoreValue[]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Navigation */}
      <nav className="flex gap-0 border-b border-[#e0ddd6] mb-6 overflow-x-auto">
        {TABS.map((label, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer bg-transparent ${
              tab === i
                ? 'text-[#1a1a1a] border-[#1a1a1a]'
                : 'text-[#888] border-transparent hover:text-[#1a1a1a]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Tab panels */}
      {tab === 0 && <OverviewTab />}
      {tab === 1 && <MaturityTab />}
      {tab === 2 && <CasesTab />}
      {tab === 3 && <ScoringTab scores={scores} onChange={setScores} />}
      {tab === 4 && <StageTab />}
      {tab === 5 && <HearingTab />}
      {tab === 6 && <KnowledgeTab />}
      {tab === 7 && <NotionTab scores={scores} />}
      {tab === 8 && <NextTab />}
    </div>
  )
}
