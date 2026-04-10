import { Client } from '@notionhq/client'
import type { NotionSavePayload } from '@/types'

const DB_NAME = 'TAヘルスチェック ナレッジDB'

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
      経営アラインメント:           { number: { format: 'number' } },
      オペレーション:               { number: { format: 'number' } },
      '品質・評価':                 { number: { format: 'number' } },
      '組織・体制':                 { number: { format: 'number' } },
      リーダーシップのコミットメント: { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      '採用戦略・計画':             { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'ストーリー発信力':           { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      ソーシング戦略:               { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'タレントパイプライン':       { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'アトラクト＆エンゲージ':     { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'プロセス・マネジメント':     { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      アセスメント品質:             { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'データ活用と改善サイクル':   { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      'TAチームの組成と配置':       { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      TAカルチャー:                 { select: { options: [{ name: 'BAD' }, { name: 'GOOD' }, { name: 'EXC' }, { name: '未評価' }] } },
      ヒアリングメモ:               { rich_text: {} },
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
      経営アラインメント:           { number: payload.catScores.経営アラインメント },
      オペレーション:               { number: payload.catScores.オペレーション },
      '品質・評価':                 { number: payload.catScores['品質・評価'] },
      '組織・体制':                 { number: payload.catScores['組織・体制'] },
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
