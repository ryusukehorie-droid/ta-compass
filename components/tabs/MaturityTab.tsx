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
          <thead>
            <tr>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[16%]">診断項目</th>
              <th className="py-2 px-2 text-center font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[9%]">カテゴリ</th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[18%]">
                <span className="inline-block bg-[#FCEBEB] text-[#791F1F] rounded px-1.5 py-0.5">BAD（Lv.1）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[19%]">
                <span className="inline-block bg-[#FFF3CC] text-[#7A5500] rounded px-1.5 py-0.5">SOSO（Lv.2）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[19%]">
                <span className="inline-block bg-[#EAF3DE] text-[#27500A] rounded px-1.5 py-0.5">GOOD（Lv.3）</span>
              </th>
              <th className="py-2 px-2 text-left font-medium text-[#888] border-b border-[#e0ddd6] bg-[#f7f6f3] w-[19%]">
                <span className="inline-block bg-[#E1F5EE] text-[#085041] rounded px-1.5 py-0.5">EXCELLENT（Lv.4）</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it, i) => (
              <tr key={i} className="hover:bg-[#fafaf8]">
                <td className="py-2 px-2 border-b border-[#f0ede8] align-top">
                  <div className="font-medium text-[12px]">{it.name}</div>
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
