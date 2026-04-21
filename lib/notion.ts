import { Client } from '@notionhq/client'
import type { NotionSavePayload, SavedResult, ScoreValue } from '@/types'
import { getLevelLabel } from '@/lib/data'

const DB_NAME = 'TAヘルスチェック ナレッジDB'

// 履歴用の追加プロパティ名
const HISTORY_PROP_SAVED_BY = '保存者'
const HISTORY_PROP_SCORES_JSON = 'スコア配列JSON'
const HISTORY_PROP_COMPARE_JSON = '比較スコア配列JSON'
const HISTORY_PROP_COMPARE_COMPANY = '比較会社名'
const HISTORY_PROP_COMPARE_DATE = '比較日'
const HISTORY_PROP_COMPARE_GRAND = '比較総合スコア'
const HISTORY_PROP_COMPARE_CAT_1 = '比較：経営アラインメント'
const HISTORY_PROP_COMPARE_CAT_2 = '比較：マーケティング＆ソーシング'
const HISTORY_PROP_COMPARE_CAT_3 = '比較：セレクション＆クロージング'
const HISTORY_PROP_COMPARE_CAT_4 = '比較：TA体制・システム'

function client() {
  const token = process.env.NOTION_TOKEN
  if (!token) throw new Error('NOTION_TOKEN is not set in environment variables')
  return new Client({ auth: token })
}

// Find or create the database under the given parent page (or search workspace)
async function findOrCreateDb(notion: Client): Promise<string> {
  // 1. Search for existing DB by title
  const search = await notion.search({
    query: DB_NAME,
    filter: { property: 'object', value: 'database' },
  })
  const found = search.results.find(
    (r) => r.object === 'database' && 'title' in r && r.title.map((t) => t.plain_text).join('') === DB_NAME
  )
  if (found) return found.id

  // 2. Create DB — needs a parent page. Use NOTION_PARENT_PAGE_ID if set,
  //    otherwise fall back to the first page we can find.
  const parentId = await resolveParentPageId(notion)

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentId },
    title: [{ type: 'text', text: { content: DB_NAME } }],
    properties: {
      会社名:                      { title: {} },
      ステージ:                    { select: { options: [{ name: 'プレシリーズA' }, { name: 'シリーズA' }, { name: 'シリーズB' }, { name: 'シリーズC以降' }, { name: '未分類' }] } },
      ヒアリング日:                { date: {} },
      総合スコア:                  { number: { format: 'number' } },
      レベル判定:                  { select: { options: [{ name: 'Lv.1 リアクティブ' }, { name: 'Lv.1〜2 移行期' }, { name: 'Lv.2 標準化' }, { name: 'Lv.3 プロアクティブ移行期' }, { name: 'Lv.3〜4 戦略的・競争優位' }] } },
      経営アラインメント:               { number: { format: 'number' } },
      'マーケティング＆ソーシング':     { number: { format: 'number' } },
      'セレクション＆クロージング':     { number: { format: 'number' } },
      'TA体制・システム':               { number: { format: 'number' } },
      リーダーシップのコミットメント: { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      '採用戦略・計画':             { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'ストーリー発信力':           { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      ソーシング戦略:               { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'タレントパイプライン':       { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'アトラクト＆エンゲージ':     { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'プロセス・マネジメント':     { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      アセスメント品質:             { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'データ活用と改善サイクル':   { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      'TAチームの組成と配置':       { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      TAカルチャー:                 { select: { options: [{ name: 'Entry' }, { name: 'Basic' }, { name: 'Good' }, { name: 'Excellent' }, { name: '未評価' }] } },
      ヒアリングメモ:               { rich_text: {} },
      [HISTORY_PROP_SAVED_BY]:         { rich_text: {} },
      [HISTORY_PROP_SCORES_JSON]:      { rich_text: {} },
      [HISTORY_PROP_COMPARE_JSON]:     { rich_text: {} },
      [HISTORY_PROP_COMPARE_COMPANY]:  { rich_text: {} },
      [HISTORY_PROP_COMPARE_DATE]:     { date: {} },
      [HISTORY_PROP_COMPARE_GRAND]:    { number: { format: 'number' } },
      [HISTORY_PROP_COMPARE_CAT_1]:    { number: { format: 'number' } },
      [HISTORY_PROP_COMPARE_CAT_2]:    { number: { format: 'number' } },
      [HISTORY_PROP_COMPARE_CAT_3]:    { number: { format: 'number' } },
      [HISTORY_PROP_COMPARE_CAT_4]:    { number: { format: 'number' } },
    },
  })
  return db.id
}

async function resolveParentPageId(notion: Client): Promise<string> {
  if (process.env.NOTION_PARENT_PAGE_ID) return process.env.NOTION_PARENT_PAGE_ID

  const res = await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 1 })
  if (res.results.length > 0) return res.results[0].id

  throw new Error(
    'Could not find a parent page to create the database. ' +
    'Set NOTION_PARENT_PAGE_ID in .env.local to a page ID that your integration has access to.'
  )
}

function selectProp(value: string | undefined) {
  if (!value) return { select: { name: '未評価' } }
  return { select: { name: value } }
}

export async function saveAssessment(payload: NotionSavePayload): Promise<string> {
  const notion = client()
  const dbId = await findOrCreateDb(notion)

  const s = payload.scores

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      会社名:                      { title: [{ text: { content: payload.company } }] },
      ステージ:                    selectProp(payload.stage || '未分類'),
      ヒアリング日:                payload.date ? { date: { start: payload.date } } : { date: null },
      総合スコア:                  { number: payload.grand },
      レベル判定:                  selectProp(payload.level),
      経営アラインメント:               { number: payload.catScores.経営アラインメント },
      'マーケティング＆ソーシング':     { number: payload.catScores['マーケティング＆ソーシング'] },
      'セレクション＆クロージング':     { number: payload.catScores['セレクション＆クロージング'] },
      'TA体制・システム':               { number: payload.catScores['TA体制・システム'] },
      リーダーシップのコミットメント: selectProp(s['リーダーシップのコミットメント']),
      '採用戦略・計画':             selectProp(s['採用戦略・計画']),
      ストーリー発信力:             selectProp(s['ストーリー発信力（EVP・採用広報）']),
      ソーシング戦略:               selectProp(s['ソーシング戦略']),
      タレントパイプライン:         selectProp(s['タレントパイプライン（先読み獲得）']),
      'アトラクト＆エンゲージ':     selectProp(s['アトラクト＆エンゲージ']),
      'プロセス・マネジメント':     selectProp(s['プロセス・マネジメント']),
      アセスメント品質:             selectProp(s['アセスメント品質']),
      'データ活用と改善サイクル':   selectProp(s['データ活用と改善サイクル']),
      'TAチームの組成と配置':       selectProp(s['TAチームの組成と配置']),
      TAカルチャー:                 selectProp(s['TAカルチャー']),
      ヒアリングメモ:               payload.memo
        ? { rich_text: [{ text: { content: payload.memo.slice(0, 2000) } }] }
        : { rich_text: [] },
    },
  })

  return (page as { url: string }).url
}

// ── 履歴機能 ─────────────────────────────────────────────────────

// 既存 DB に履歴用カラム + 現行カテゴリ名カラムが無ければ追加する（冪等）
async function ensureHistorySchema(notion: Client, dbId: string): Promise<void> {
  const db = await notion.databases.retrieve({ database_id: dbId })
  const existing = (db as { properties: Record<string, unknown> }).properties
  const toAdd: Record<string, unknown> = {}
  // 現行カテゴリ4列（旧スキーマで作られた DB に不足している場合がある）
  if (!existing['経営アラインメント'])               toAdd['経営アラインメント']               = { number: { format: 'number' } }
  if (!existing['マーケティング＆ソーシング'])       toAdd['マーケティング＆ソーシング']       = { number: { format: 'number' } }
  if (!existing['セレクション＆クロージング'])       toAdd['セレクション＆クロージング']       = { number: { format: 'number' } }
  if (!existing['TA体制・システム'])                 toAdd['TA体制・システム']                 = { number: { format: 'number' } }
  // 履歴用カラム
  if (!existing[HISTORY_PROP_SAVED_BY])         toAdd[HISTORY_PROP_SAVED_BY]         = { rich_text: {} }
  if (!existing[HISTORY_PROP_SCORES_JSON])      toAdd[HISTORY_PROP_SCORES_JSON]      = { rich_text: {} }
  if (!existing[HISTORY_PROP_COMPARE_JSON])     toAdd[HISTORY_PROP_COMPARE_JSON]     = { rich_text: {} }
  if (!existing[HISTORY_PROP_COMPARE_COMPANY])  toAdd[HISTORY_PROP_COMPARE_COMPANY]  = { rich_text: {} }
  if (!existing[HISTORY_PROP_COMPARE_DATE])     toAdd[HISTORY_PROP_COMPARE_DATE]     = { date: {} }
  if (!existing[HISTORY_PROP_COMPARE_GRAND])    toAdd[HISTORY_PROP_COMPARE_GRAND]    = { number: { format: 'number' } }
  if (!existing[HISTORY_PROP_COMPARE_CAT_1])    toAdd[HISTORY_PROP_COMPARE_CAT_1]    = { number: { format: 'number' } }
  if (!existing[HISTORY_PROP_COMPARE_CAT_2])    toAdd[HISTORY_PROP_COMPARE_CAT_2]    = { number: { format: 'number' } }
  if (!existing[HISTORY_PROP_COMPARE_CAT_3])    toAdd[HISTORY_PROP_COMPARE_CAT_3]    = { number: { format: 'number' } }
  if (!existing[HISTORY_PROP_COMPARE_CAT_4])    toAdd[HISTORY_PROP_COMPARE_CAT_4]    = { number: { format: 'number' } }
  if (Object.keys(toAdd).length === 0) return
  await notion.databases.update({
    database_id: dbId,
    properties: toAdd as Parameters<typeof notion.databases.update>[0]['properties'],
  })
}

function richText(value: string | undefined) {
  if (!value) return { rich_text: [] }
  return { rich_text: [{ text: { content: value.slice(0, 2000) } }] }
}

function readTitle(prop: unknown): string {
  const p = prop as { title?: { plain_text: string }[] }
  return p?.title?.map((t) => t.plain_text).join('') ?? ''
}
function readRichText(prop: unknown): string {
  const p = prop as { rich_text?: { plain_text: string }[] }
  return p?.rich_text?.map((t) => t.plain_text).join('') ?? ''
}
function readNumber(prop: unknown): number | null {
  const p = prop as { number?: number | null }
  return p?.number ?? null
}
function readDate(prop: unknown): string {
  const p = prop as { date?: { start?: string } | null }
  return p?.date?.start ?? ''
}
function readSelect(prop: unknown): string {
  const p = prop as { select?: { name: string } | null }
  return p?.select?.name ?? ''
}

function parseScoresJson(json: string): ScoreValue[] | undefined {
  if (!json) return undefined
  try {
    const arr = JSON.parse(json) as unknown
    if (!Array.isArray(arr)) return undefined
    return arr.map((v) => (typeof v === 'number' && v >= 0 && v <= 4 ? (v as ScoreValue) : 0))
  } catch {
    return undefined
  }
}

export async function saveHistoryEntry(result: SavedResult): Promise<string> {
  const notion = client()
  const dbId = await findOrCreateDb(notion)
  await ensureHistorySchema(notion, dbId)

  const props: Record<string, unknown> = {
    会社名:                      { title: [{ text: { content: result.company } }] },
    ヒアリング日:                result.date ? { date: { start: result.date } } : { date: null },
    総合スコア:                  { number: result.grand },
    レベル判定:                  { select: { name: result.level } },
    経営アラインメント:               { number: result.catTotals[0] },
    'マーケティング＆ソーシング':     { number: result.catTotals[1] },
    'セレクション＆クロージング':     { number: result.catTotals[2] },
    'TA体制・システム':               { number: result.catTotals[3] },
    [HISTORY_PROP_SAVED_BY]:     richText(result.savedBy),
    [HISTORY_PROP_SCORES_JSON]:  richText(JSON.stringify(result.scores)),
  }

  if (result.compareScores && result.compareGrand != null) {
    props[HISTORY_PROP_COMPARE_JSON]    = richText(JSON.stringify(result.compareScores))
    props[HISTORY_PROP_COMPARE_COMPANY] = richText(result.compareCompany)
    props[HISTORY_PROP_COMPARE_DATE]    = result.compareDate ? { date: { start: result.compareDate } } : { date: null }
    props[HISTORY_PROP_COMPARE_GRAND]   = { number: result.compareGrand }
    if (result.compareCatTotals) {
      props[HISTORY_PROP_COMPARE_CAT_1] = { number: result.compareCatTotals[0] }
      props[HISTORY_PROP_COMPARE_CAT_2] = { number: result.compareCatTotals[1] }
      props[HISTORY_PROP_COMPARE_CAT_3] = { number: result.compareCatTotals[2] }
      props[HISTORY_PROP_COMPARE_CAT_4] = { number: result.compareCatTotals[3] }
    }
  }

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: props as Parameters<typeof notion.pages.create>[0]['properties'],
  })

  return (page as { id: string }).id
}

export async function listHistoryEntries(): Promise<SavedResult[]> {
  const notion = client()
  const dbId = await findOrCreateDb(notion)
  await ensureHistorySchema(notion, dbId)

  const results: SavedResult[] = []
  let cursor: string | undefined = undefined
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      page_size: 100,
      start_cursor: cursor,
      filter: {
        property: HISTORY_PROP_SCORES_JSON,
        rich_text: { is_not_empty: true },
      },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    })
    for (const page of res.results) {
      if (!('properties' in page)) continue
      const p = (page as { properties: Record<string, unknown>; id: string; created_time: string })
      const scores = parseScoresJson(readRichText(p.properties[HISTORY_PROP_SCORES_JSON]))
      if (!scores || scores.length === 0) continue

      const compareScores = parseScoresJson(readRichText(p.properties[HISTORY_PROP_COMPARE_JSON]))
      const compareGrand  = readNumber(p.properties[HISTORY_PROP_COMPARE_GRAND])
      const catTotals: [number, number, number, number] = [
        readNumber(p.properties['経営アラインメント']) ?? 0,
        readNumber(p.properties['マーケティング＆ソーシング']) ?? 0,
        readNumber(p.properties['セレクション＆クロージング']) ?? 0,
        readNumber(p.properties['TA体制・システム']) ?? 0,
      ]

      const grand = readNumber(p.properties['総合スコア']) ?? 0
      const level = readSelect(p.properties['レベル判定']) || getLevelLabel(grand)

      const entry: SavedResult = {
        id: p.id,
        company: readTitle(p.properties['会社名']) || '（会社名なし）',
        date: readDate(p.properties['ヒアリング日']),
        scores,
        grand,
        level,
        catTotals,
        savedAt: p.created_time,
        savedBy: readRichText(p.properties[HISTORY_PROP_SAVED_BY]) || undefined,
      }

      if (compareScores && compareGrand != null) {
        entry.compareScores   = compareScores
        entry.compareGrand    = compareGrand
        entry.compareCompany  = readRichText(p.properties[HISTORY_PROP_COMPARE_COMPANY]) || undefined
        entry.compareDate     = readDate(p.properties[HISTORY_PROP_COMPARE_DATE]) || undefined
        entry.compareLevel    = getLevelLabel(compareGrand)
        const c1 = readNumber(p.properties[HISTORY_PROP_COMPARE_CAT_1])
        const c2 = readNumber(p.properties[HISTORY_PROP_COMPARE_CAT_2])
        const c3 = readNumber(p.properties[HISTORY_PROP_COMPARE_CAT_3])
        const c4 = readNumber(p.properties[HISTORY_PROP_COMPARE_CAT_4])
        entry.compareCatTotals = [c1 ?? 0, c2 ?? 0, c3 ?? 0, c4 ?? 0]
      }

      results.push(entry)
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined
  } while (cursor)

  return results
}

export async function archiveHistoryEntry(pageId: string): Promise<void> {
  const notion = client()
  await notion.pages.update({ page_id: pageId, archived: true })
}
