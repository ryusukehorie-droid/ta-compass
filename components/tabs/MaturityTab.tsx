import { ITEMS, CATS } from '@/lib/data'
import Pill from '@/components/Pill'

export default function MaturityTab() {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-4">
        成熟度マップ — BAD / SOSO / GOOD / EXCELLENT の定義（4段階）
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[14%]">
                診断項目
              </th>
              <th className="py-2 px-2 text-center font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[8%]">
                カテゴリ
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[18%]">
                <span className="inline-block bg-[#FCEBEB] text-[#791F1F] rounded px-1.5 py-0.5">BAD（Lv.1）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[18%]">
                <span className="inline-block bg-[#FFF3CC] text-[#7A5500] rounded px-1.5 py-0.5">SOSO（Lv.2）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[21%]">
                <div className="flex flex-col gap-1">
                  <span className="inline-block bg-[#EAF3DE] text-[#27500A] rounded px-1.5 py-0.5 self-start">GOOD（Lv.3）</span>
                  <span className="text-[9px] text-[#27500A] bg-[#EAF3DE] rounded px-1.5 py-0.5 self-start font-normal">
                    👤 主にCEOがドライブ
                  </span>
                </div>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[21%]">
                <div className="flex flex-col gap-1">
                  <span className="inline-block bg-[#E1F5EE] text-[#085041] rounded px-1.5 py-0.5 self-start">EXCELLENT（Lv.4）</span>
                  <span className="text-[9px] text-[#085041] bg-[#E1F5EE] rounded px-1.5 py-0.5 self-start font-normal">
                    👥 経営陣全体でドライブ
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it, i) => (
              <tr key={i} className="hover:bg-[#fafaf8]">
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="text-[9px] text-[#bbb] mr-0.5">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="font-medium text-[12px]">{it.name}</span>
                  <div className="text-[10px] text-[#aaa] mt-0.5">{it.sub}</div>
                </td>
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top text-center">
                  <Pill cat={it.cat} label={CATS[it.cat]} />
                </td>
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#FCEBEB] text-[#791F1F] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.bad}
                  </span>
                </td>
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#FFF3CC] text-[#7A5500] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.soso}
                  </span>
                </td>
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#EAF3DE] text-[#27500A] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.good}
                  </span>
                </td>
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <span className="block bg-[#E1F5EE] text-[#085041] rounded px-1.5 py-1 text-[11px] leading-snug">
                    {it.exc}
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
