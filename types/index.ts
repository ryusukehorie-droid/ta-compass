export type Category = 0 | 1 | 2 | 3

export interface DiagItem {
  cat: Category
  name: string
  sub: string
  bad: string
  soso: string
  good: string
  exc: string
  qs: [string, string, string]
  intent: string
}

export interface CaseEntry {
  lv: 'good' | 'exc'
  note: string
  url: string
  src: string
}

export type CompanyName = 'LayerX' | 'ログラス' | 'ナレッジワーク' | 'メルカリ' | 'SmartHR' | 'freee'

export type ScoreValue = 0 | 1 | 2 | 3 | 4

export interface ScoreState {
  scores: ScoreValue[]
  totals: [number, number, number, number]
  counts: [number, number, number, number]
  grand: number
}

export type KnowledgeType = '事例' | '施策・アクション' | '参考記事' | '独自知見'
export type DiagLevel = 'BAD' | 'SOSO' | 'GOOD' | 'EXC'

export interface KnowledgeEntry {
  id: string
  title: string
  type: KnowledgeType
  body: string
  relatedItems: number[]   // ITEMS配列のインデックス (0-10)
  relatedLevels: DiagLevel[]
  company?: string
  sourceName?: string
  sourceUrl?: string
  tags: string[]
  createdAt: string
}

export interface KnowledgeCreatePayload {
  title: string
  type: KnowledgeType
  body: string
  relatedItems: number[]
  relatedLevels: DiagLevel[]
  company?: string
  sourceName?: string
  sourceUrl?: string
  tags: string[]
}

export interface NotionSavePayload {
  company: string
  stage: string
  date: string
  memo: string
  grand: number
  level: string
  scores: Record<string, string>
  catScores: {
    経営アラインメント: number
    'マーケティング＆ソーシング': number
    'セレクション＆クロージング': number
    'TA体制・システム': number
  }
}
