export default function StageTab() {
  const stages = [
    {
      name: 'シリーズA',
      sub: 'PMF〜初期スケール（〜50名）',
      color: '#A32D2D',
      rows: [
        { label: '経営アラインメント', val: '3〜4点 /6', cls: 'bg-[#FCEBEB] text-[#791F1F]' },
        { label: 'オペレーション',     val: '4〜6点 /15', cls: 'bg-[#FCEBEB] text-[#791F1F]' },
        { label: '品質・評価',         val: '2〜3点 /6', cls: 'bg-[#FCEBEB] text-[#791F1F]' },
        { label: '組織・体制',         val: '2〜3点 /6', cls: 'bg-[#FCEBEB] text-[#791F1F]' },
      ],
      min: '12点以上',
      ideal: '15〜20点',
      must: '経営AL 両項目2点以上',
      mustColor: '#A32D2D',
    },
    {
      name: 'シリーズB',
      sub: 'スケール開始期（50〜200名）',
      color: '#BA7517',
      rows: [
        { label: '経営アラインメント', val: '5〜6点 /6',  cls: 'bg-[#FAEEDA] text-[#633806]' },
        { label: 'オペレーション',     val: '8〜11点 /15', cls: 'bg-[#FAEEDA] text-[#633806]' },
        { label: '品質・評価',         val: '4〜5点 /6',  cls: 'bg-[#FAEEDA] text-[#633806]' },
        { label: '組織・体制',         val: '4〜5点 /6',  cls: 'bg-[#FAEEDA] text-[#633806]' },
      ],
      min: '20点以上',
      ideal: '23〜28点',
      must: '経営AL 両項目3点＋TAカルチャーGOOD',
      mustColor: '#BA7517',
    },
    {
      name: 'シリーズC以降',
      sub: 'ハイパーグロース〜IPO準備（200名〜）',
      color: '#185FA5',
      rows: [
        { label: '経営アラインメント', val: '6点（両項目Excellent）', cls: 'bg-[#E6F1FB] text-[#0C447C]' },
        { label: 'オペレーション',     val: '12〜15点 /15',     cls: 'bg-[#E6F1FB] text-[#0C447C]' },
        { label: '品質・評価',         val: '5〜6点 /6',        cls: 'bg-[#E6F1FB] text-[#0C447C]' },
        { label: '組織・体制',         val: '5〜6点 /6',        cls: 'bg-[#E6F1FB] text-[#0C447C]' },
      ],
      min: '27点以上',
      ideal: '30〜33点',
      must: '全カテゴリGood以上＋TAカルチャーExcellent',
      mustColor: '#185FA5',
    },
  ]

  return (
    <div>
      <div className="text-[11px] font-medium tracking-widest text-[#888] uppercase mb-4">
        ステージ別 最低ライン基準
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stages.map((st) => (
          <div key={st.name} className="border border-[#e8e6e0] rounded-xl p-4 bg-white">
            <div className="text-[13px] font-medium mb-0.5" style={{ color: st.color }}>{st.name}</div>
            <div className="text-[10px] text-[#888] mb-3">{st.sub}</div>
            {st.rows.map((r) => (
              <div key={r.label} className="flex justify-between items-center py-1 border-b border-[#f0ede8] text-[11px]">
                <span className="text-[#888]">{r.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${r.cls}`}>{r.val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-1 border-b border-[#f0ede8] text-[11px] mt-1.5">
              <span className="font-medium">最低ライン</span>
              <span className="font-medium" style={{ color: st.color }}>{st.min}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#f0ede8] text-[11px]">
              <span className="font-medium">理想スコア</span>
              <span>{st.ideal}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-[11px]">
              <span className="font-medium" style={{ color: st.mustColor }}>必達</span>
              <span className="text-[10px] text-right" style={{ color: st.mustColor }}>{st.must}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#f7f6f3] rounded-lg px-4 py-3 text-[12px] text-[#555] leading-relaxed">
        <p className="mb-2">
          <span className="font-medium text-[#1a1a1a]">経営アラインメントの読み方：</span>
          2項目のどちらかがEntry（1点）の場合、他カテゴリのスコアに関わらず「要注意フラグ」として別途記載することを推奨。
        </p>
        <p>
          <span className="font-medium text-[#1a1a1a]">TAカルチャーの数値ベンチマーク：</span>
          ナレッジワークはリファラル70%以上、LayerXはリファラル31%・SNS21%・エージェント15%。リファラルが全採用の30%未満の場合はGood到達を疑うべき水準。
        </p>
      </div>
    </div>
  )
}
