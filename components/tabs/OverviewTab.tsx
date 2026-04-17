import { ITEMS, CATS, CAT_PILL } from '@/lib/data'

const CAT_MAX = [8, 12, 12, 12]
const CAT_BORDER = ['border-[#534AB7]', 'border-[#EF9F27]', 'border-[#185FA5]', 'border-[#D4537E]']
const CAT_HEADER_BG = ['bg-[#EEEDFE]', 'bg-[#FAEEDA]', 'bg-[#E6F1FB]', 'bg-[#FBEAF0]']

export default function OverviewTab() {
  const grouped = [0, 1, 2, 3].map((cat) =>
    ITEMS.map((it, i) => ({ ...it, idx: i })).filter((it) => it.cat === cat)
  )

  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-1">
        TAレベルヘルスチェック v4 — 11項目・44点満点
      </div>
      <p className="text-[12px] text-[#888] mb-5">4カテゴリ・11項目で投資先TAチームの成熟度を診断。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {grouped.map((items, cat) => {
          const { bg, text } = CAT_PILL[cat]
          return (
            <div key={cat} className={`rounded-xl border-2 ${CAT_BORDER[cat]} overflow-hidden`}>
              {/* カテゴリヘッダー */}
              <div className={`${CAT_HEADER_BG[cat]} px-3 py-2 flex items-center justify-between`}>
                <span className={`text-[12px] font-bold ${text}`}>{CATS[cat]}</span>
                <span className={`text-[10px] font-medium ${text} opacity-70`}>
                  {items.length}項目・{CAT_MAX[cat]}点満点
                </span>
              </div>
              {/* 項目一覧 */}
              <div className="divide-y divide-[#f0ede8] bg-white">
                {items.map((it) => (
                  <div key={it.idx} className="flex items-start gap-2 px-3 py-2.5">
                    <span className="text-[10px] text-[#bbb] mt-0.5 shrink-0 w-5">
                      {String(it.idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-[12px] font-medium leading-snug">{it.name}</div>
                      <div className="text-[10px] text-[#aaa] mt-0.5 leading-snug">{it.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#f7f6f3] rounded-lg px-4 py-3 text-[12px] text-[#555] leading-relaxed">
        <span className="text-[#1a1a1a] font-medium">特別ルール：</span>
        経営アラインメントのどちらか一方がEntry（1点）の場合、総合スコアに関わらず「要注意フラグ」を別途記載。
      </div>
    </div>
  )
}
