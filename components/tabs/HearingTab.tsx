'use client'

import { useState } from 'react'
import { ITEMS, CATS, CASES } from '@/lib/data'
import Pill from '@/components/Pill'

export default function HearingTab() {
  const [catFilter, setCatFilter] = useState<number | 'all'>('all')
  const [showLX, setShowLX] = useState(false)

  return (
    <div>
      <p className="text-[12px] text-[#888] mb-3">11項目×3問・計33問。設問は汎用表現で記述。LayerX参照例はオプションで表示。</p>

      <div className="flex gap-2 items-center mb-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 0, 1, 2, 3] as const).map((f) => (
            <button
              key={String(f)}
              onClick={() => setCatFilter(f)}
              className={`px-3 py-1 text-[12px] border rounded-full transition-colors ${
                catFilter === f
                  ? 'bg-[#E6F1FB] text-[#0C447C] border-[#378ADD]'
                  : 'bg-transparent text-[#888] border-[#ccc] hover:bg-[#f7f6f3]'
              }`}
            >
              {f === 'all' ? '全て' : CATS[f]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowLX(!showLX)}
          className={`ml-auto text-[11px] cursor-pointer px-3 py-1 border rounded-full transition-colors whitespace-nowrap ${
            showLX ? 'bg-[#EEEDFE] text-[#3C3489] border-[#AFA9EC]' : 'bg-transparent text-[#888] border-[#ccc]'
          }`}
        >
          {showLX ? 'LayerX参照例を非表示' : 'LayerX参照例を表示'}
        </button>
      </div>

      {ITEMS.map((it, i) => {
        if (catFilter !== 'all' && it.cat !== catFilter) return null
        const lx = CASES.LayerX[i]
        return (
          <div key={i} className="border border-[#e8e6e0] rounded-xl mb-2 bg-white overflow-hidden">
            <div className="flex gap-2 items-start px-3 py-2.5 border-b border-[#f0ede8]">
              <span className="text-[11px] font-medium text-[#aaa] pt-0.5 min-w-[22px]">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <div className="text-[13px] font-medium">{it.name}</div>
              </div>
              <Pill cat={it.cat} label={CATS[it.cat]} />
            </div>
            <div className="px-3 pb-3 pt-2">
              <ul className="list-none p-0">
                {it.qs.map((q, qi) => (
                  <li key={qi} className="text-[12px] text-[#555] py-1 pl-4 relative leading-relaxed border-b border-[#f0ede8] last:border-0">
                    <span className="absolute left-0 top-1.5 text-[10px] font-medium text-[#aaa]">Q</span>
                    {q}
                  </li>
                ))}
              </ul>
              <div className="mt-2 px-2.5 py-2 bg-[#f7f6f3] rounded-lg text-[11px] text-[#666] leading-relaxed">
                <span className="font-medium text-[#1a1a1a]">確認の意図：</span>{it.intent}
              </div>
              {showLX && (
                <div className="mt-1.5 px-2.5 py-2 bg-[#EEEDFE] rounded-lg text-[11px] text-[#3C3489] leading-relaxed">
                  <span className="font-semibold text-[#26215C]">LayerX参照例：</span>{lx.note}
                  {lx.url && (
                    <a
                      href={lx.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center gap-1 text-[10px] text-[#378ADD] px-1.5 py-0.5 border border-[#c8dff5] rounded-lg bg-[#F0F7FF] hover:bg-[#deeeff]"
                    >
                      {lx.src}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
