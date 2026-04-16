import { ITEMS, CATS, CAT_PILL } from '@/lib/data'
import Pill from '@/components/Pill'

export default function OverviewTab() {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-1">
        TAレベルヘルスチェック v4 — 11項目・44点満点
      </div>
      <p className="text-[12px] text-[#888] mb-4">4カテゴリ・11項目で投資先TAチームの成熟度を診断。</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
        {ITEMS.map((it, i) => (
          <div key={i} className="border border-[#e8e6e0] rounded-xl p-3 bg-white">
            <div className="text-[11px] font-medium text-[#aaa] mb-1">
              {String(i + 1).padStart(2, '0')}{' '}
              <Pill cat={it.cat} label={CATS[it.cat]} />
            </div>
            <div className="text-[13px] font-medium leading-snug mb-0.5">{it.name}</div>
            <div className="text-[11px] text-[#888] leading-snug">{it.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {([
          { cat: 0, max: 8,  items: 2 },
          { cat: 1, max: 12, items: 3 },
          { cat: 2, max: 12, items: 3 },
          { cat: 3, max: 12, items: 3 },
        ] as const).map((c) => {
          const { bg, text } = CAT_PILL[c.cat]
          return (
            <div key={c.cat} className={`p-2 border border-[#e8e6e0] rounded-lg text-center ${bg}`}>
              <div className={`text-[10px] ${text} mb-0.5`}>{CATS[c.cat]}</div>
              <div className={`text-[16px] font-medium ${text}`}>{c.max}点</div>
              <div className="text-[10px] text-[#aaa]">{c.items}項目</div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#f7f6f3] rounded-lg px-4 py-3 text-[12px] text-[#555] leading-relaxed">
        <span className="text-[#1a1a1a] font-medium">特別ルール：</span>
        経営アラインメントのどちらか一方がBAD（1点）の場合、総合スコアに関わらず「要注意フラグ」を別途記載。
      </div>
    </div>
  )
}
