import { ITEMS, CATS } from '@/lib/data'
import Pill from '@/components/Pill'

export default function MaturityTab() {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-4">
        成熟度マップ — Entry / Developing / Standard / Excellent の定義（4段階）
      </div>

      {/* overflow-y-auto + max-h で sticky header が機能する */}
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-[#e0ddd6]" style={{ maxHeight: '75vh' }}>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="sticky top-0 z-10">
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[14%]">
                診断項目
              </th>
              <th className="py-2 px-2 text-center font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[8%]">
                カテゴリ
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[18%]">
                <span className="inline-block bg-[#FCEBEB] text-[#791F1F] rounded px-1.5 py-0.5">Entry（Lv.1）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[18%]">
                <span className="inline-block bg-[#FFF3CC] text-[#7A5500] rounded px-1.5 py-0.5">Developing（Lv.2）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[21%]">
                <span className="inline-block bg-[#EAF3DE] text-[#27500A] rounded px-1.5 py-0.5">Standard（Lv.3）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[21%]">
                <span className="inline-block bg-[#E1F5EE] text-[#085041] rounded px-1.5 py-0.5">Excellent（Lv.4）</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it, i) => (
              <tr key={i} className="hover:bg-[#fafaf8]">
                {/* 診断項目名 */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="text-[9px] text-[#bbb] mr-0.5">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="font-medium text-[12px]">{it.name}</span>
                  <div className="text-[10px] text-[#aaa] mt-0.5">{it.sub}</div>
                </td>

                {/* カテゴリ */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top text-center">
                  <Pill cat={it.cat} label={CATS[it.cat]} />
                </td>

                {/* BAD */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#FCEBEB] text-[#791F1F] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.bad}
                  </span>
                </td>

                {/* SOSO */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#FFF3CC] text-[#7A5500] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.soso}
                  </span>
                </td>

                {/* GOOD — item0のみCEOバッジを表示 */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-[#EAF3DE] text-[#27500A] border border-[#c5e0b0] rounded px-1.5 py-0.5 mb-1">
                      👤 CEOが主導
                    </span>
                  )}
                  <span className="block bg-[#EAF3DE] text-[#27500A] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {/* item0は【CEOが主導】プレフィックスを除いて表示 */}
                    {i === 0 ? it.good.replace('【CEOが主導】', '') : it.good}
                  </span>
                </td>

                {/* EXC — item0のみ経営陣全体バッジを表示 */}
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-[#E1F5EE] text-[#085041] border border-[#a0d9c8] rounded px-1.5 py-0.5 mb-1">
                      👥 経営陣全体が主導
                    </span>
                  )}
                  <span className="block bg-[#E1F5EE] text-[#085041] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {i === 0 ? it.exc.replace('【経営陣全体が主導】', '') : it.exc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
