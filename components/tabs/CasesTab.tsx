'use client'

import { useState } from 'react'
import { ITEMS, CATS, COMPANIES, CASES, COMP_COLORS } from '@/lib/data'
import Pill from '@/components/Pill'
import type { CompanyName } from '@/types'

function SrcLink({ url, src }: { url: string; src: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-[#378ADD] px-1.5 py-0.5 border border-[#c8dff5] rounded-lg mt-1.5 bg-[#F0F7FF] hover:bg-[#deeeff]"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 1h3m0 0v3m0-3L5.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {src}
      </a>
    )
  }
  return (
    <span className="inline-block text-[10px] text-[#aaa] px-1.5 py-0.5 border border-[#e8e6e0] rounded-lg mt-1.5 bg-[#f7f6f3]">
      {src}（ソース未公開）
    </span>
  )
}

export default function CasesTab() {
  const [axis, setAxis] = useState<'item' | 'comp'>('item')
  const [catFilter, setCatFilter] = useState<number | 'all'>('all')
  const [currentComp, setCurrentComp] = useState<CompanyName>('LayerX')

  const firstRow = COMPANIES.slice(0, 3)
  const secondRow = COMPANIES.slice(3)

  return (
    <div>
      <p className="text-[12px] text-[#888] mb-4">あくまでgood exampleの参照として活用。診断項目軸では全社を横断比較できます。</p>

      {/* Axis toggle */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] font-medium text-[#888] uppercase tracking-wide">表示軸：</span>
        <div className="flex border border-[#e0ddd6] rounded-lg overflow-hidden">
          <button
            onClick={() => setAxis('item')}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${axis === 'item' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#888]'}`}
          >
            診断項目軸
          </button>
          <button
            onClick={() => setAxis('comp')}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${axis === 'comp' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#888]'}`}
          >
            会社軸
          </button>
        </div>
      </div>

      {/* Item axis */}
      {axis === 'item' && (
        <>
          <div className="flex gap-1.5 flex-wrap mb-3">
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
                {f === 'all' ? '全項目' : CATS[f]}
              </button>
            ))}
          </div>

          {ITEMS.map((it, i) => {
            if (catFilter !== 'all' && it.cat !== catFilter) return null
            return (
              <div key={i} className="border border-[#e8e6e0] rounded-lg mb-2 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f6f3] border-b border-[#e8e6e0]">
                  <span className="text-[11px] font-medium text-[#aaa]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium text-[13px] flex-1">{it.name}</span>
                  <Pill cat={it.cat} label={CATS[it.cat]} />
                </div>
                {/* First row of companies */}
                <div className="grid grid-cols-1 sm:grid-cols-3">
                  {firstRow.map((co, ci) => {
                    const d = CASES[co][i]
                    const cc = COMP_COLORS[co]
                    const isExc = d.lv === 'exc'
                    return (
                      <div
                        key={co}
                        className={`p-2.5 ${ci < 2 ? 'border-r border-[#e8e6e0]' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[10px] border"
                            style={{ background: cc.bg, color: cc.color, borderColor: cc.border }}
                          >
                            {co}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${isExc ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#EAF3DE] text-[#27500A]'}`}>
                            {isExc ? 'EXC' : 'GOOD'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555] leading-relaxed">{d.note}</p>
                        <SrcLink url={d.url} src={d.src} />
                      </div>
                    )
                  })}
                </div>
                {/* Second row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-dashed border-[#e8e6e0]">
                  {secondRow.map((co, ci) => {
                    const d = CASES[co][i]
                    const cc = COMP_COLORS[co]
                    const isExc = d.lv === 'exc'
                    return (
                      <div
                        key={co}
                        className={`p-2.5 bg-[#fafaf8] ${ci < 2 ? 'border-r border-[#e8e6e0]' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[10px] border"
                            style={{ background: cc.bg, color: cc.color, borderColor: cc.border }}
                          >
                            {co}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${isExc ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#EAF3DE] text-[#27500A]'}`}>
                            {isExc ? 'EXC' : 'GOOD'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555] leading-relaxed">{d.note}</p>
                        <SrcLink url={d.url} src={d.src} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Company axis */}
      {axis === 'comp' && (
        <>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {COMPANIES.map((co) => {
              const cc = COMP_COLORS[co]
              const active = currentComp === co
              return (
                <button
                  key={co}
                  onClick={() => setCurrentComp(co)}
                  className="px-3 py-1 text-[12px] border rounded-full transition-colors"
                  style={
                    active
                      ? { background: cc.bg, color: cc.color, borderColor: cc.border }
                      : { background: 'transparent', color: '#888', borderColor: '#ccc' }
                  }
                >
                  {co}
                </button>
              )
            })}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[22%]">診断項目</th>
                  <th className="py-2 px-2 text-center font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[10%]">レベル</th>
                  <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3]">具体的実践</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS.map((it, i) => {
                  const d = CASES[currentComp][i]
                  const isExc = d.lv === 'exc'
                  return (
                    <tr key={i} className="hover:bg-[#fafaf8]">
                      <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                        <Pill cat={it.cat} label={CATS[it.cat]} />
                        <div className="font-medium text-[12px] mt-1">{it.name}</div>
                      </td>
                      <td className="py-2 px-2 border-b border-[#f0ede8] align-top text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${isExc ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#EAF3DE] text-[#27500A]'}`}>
                          {isExc ? 'EXCELLENT' : 'GOOD'}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                        <p className="leading-relaxed">{d.note}</p>
                        <SrcLink url={d.url} src={d.src} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
