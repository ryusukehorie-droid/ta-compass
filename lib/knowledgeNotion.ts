import { Client } from '@notionhq/client'
import { ITEMS } from '@/lib/data'
import type { KnowledgeEntry, KnowledgeCreatePayload, DiagLevel, KnowledgeType } from '@/types'

const DB_NAME = 'TAナレッジDB'

const KNOWLEDGE_TYPES: KnowledgeType[] = ['事例', '施策・アクション', '参考記事', '独自知見']
const DIAG_LEVELS: DiagLevel[] = ['Entry', 'Basic', 'Good', 'Excellent']
const ITEM_NAMES = ITEMS.map((it) => it.name)

function client() {
  const token = process.env.NOTION_TOKEN
  if (!token) throw new Error('NOTION_TOKEN is not set')
  return new Client({ auth: token })
}

// ── DB 作成 or 既存取得 ────────────────────────────────────────────
async function findOrCreateKnowledgeDb(notion: Client): Promise<string> {
  const search = await notion.search({
    query: DB_NAME,
    filter: { property: 'object', value: 'database' },
  })
  const found = search.results.find(
    (r) => r.object === 'database' && 'title' in r &&
      r.title.map((t) => t.plain_text).join('') === DB_NAME
  )
  if (found) return found.id

  const parentId = await resolveParentPageId(notion)

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentId },
    title: [{ type: 'text', text: { content: DB_NAME } }],
    properties: {
      タイトル:   { title: {} },
      タイプ:     { select: { options: KNOWLEDGE_TYPES.map((n) => ({ name: n })) } },
      診断項目:   { multi_select: { options: ITEM_NAMES.map((n) => ({ name: n })) } },
      対象レベル: { multi_select: { options: DIAG_LEVELS.map((n) => ({ name: n })) } },
      本文:       { rich_text: {} },
      会社名:     { rich_text: {} },
      ソース名:   { rich_text: {} },
      URL:        { url: {} },
      タグ:       { multi_select: {} },
    },
  })
  return db.id
}

async function resolveParentPageId(notion: Client): Promise<string> {
  if (process.env.NOTION_PARENT_PAGE_ID) return process.env.NOTION_PARENT_PAGE_ID
  const res = await notion.search({ filter: { property: 'object', value: 'page' }, page_size: 1 })
  if (res.results.length > 0) return res.results[0].id
  throw new Error('親ページが見つかりません。NOTION_PARENT_PAGE_ID を .env.local に設定してください。')
}

// ── Notionページ → KnowledgeEntry 変換 ──────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToEntry(page: any): KnowledgeEntry {
  const props = page.properties

  const getText = (p: { rich_text?: { plain_text: string }[] }) =>
    p?.rich_text?.map((t) => t.plain_text).join('') ?? ''

  const relatedItems = (props.診断項目?.multi_select ?? [])
    .map((opt: { name: string }) => ITEM_NAMES.indexOf(opt.name))
    .filter((i: number) => i >= 0) as number[]

  const relatedLevels = (props.対象レベル?.multi_select ?? [])
    .map((opt: { name: string }) => opt.name) as DiagLevel[]

  return {
    id: page.id,
    title: props.タイトル?.title?.map((t: { plain_text: string }) => t.plain_text).join('') ?? '',
    type: (props.タイプ?.select?.name ?? '参考記事') as KnowledgeType,
    body: getText(props.本文),
    relatedItems,
    relatedLevels,
    company: getText(props.会社名) || undefined,
    sourceName: getText(props.ソース名) || undefined,
    sourceUrl: props.URL?.url ?? undefined,
    tags: (props.タグ?.multi_select ?? []).map((t: { name: string }) => t.name),
    createdAt: page.created_time ?? '',
  }
}

// ── 取得（フィルタ付き） ─────────────────────────────────────────
export async function fetchKnowledge(opts?: {
  itemIndex?: number
  level?: DiagLevel
  type?: KnowledgeType
}): Promise<KnowledgeEntry[]> {
  const notion = client()
  const dbId = await findOrCreateKnowledgeDb(notion)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = []

  if (opts?.itemIndex !== undefined) {
    filters.push({
      property: '診断項目',
      multi_select: { contains: ITEM_NAMES[opts.itemIndex] },
    })
  }
  if (opts?.level) {
    filters.push({
      property: '対象レベル',
      multi_select: { contains: opts.level },
    })
  }
  if (opts?.type) {
    filters.push({
      property: 'タイプ',
      select: { equals: opts.type },
    })
  }

  const res = await notion.databases.query({
    database_id: dbId,
    filter: filters.length > 0
      ? filters.length === 1 ? filters[0] : { and: filters }
      : undefined,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    page_size: 100,
  })

  return res.results.map(pageToEntry)
}

// ── 追加 ─────────────────────────────────────────────────────────
export async function createKnowledge(payload: KnowledgeCreatePayload): Promise<KnowledgeEntry> {
  const notion = client()
  const dbId = await findOrCreateKnowledgeDb(notion)

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      タイトル:   { title: [{ text: { content: payload.title } }] },
      タイプ:     { select: { name: payload.type } },
      診断項目:   { multi_select: payload.relatedItems.map((i) => ({ name: ITEM_NAMES[i] })) },
      対象レベル: { multi_select: payload.relatedLevels.map((l) => ({ name: l })) },
      本文:       { rich_text: [{ text: { content: payload.body.slice(0, 2000) } }] },
      会社名:     payload.company ? { rich_text: [{ text: { content: payload.company } }] } : { rich_text: [] },
      ソース名:   payload.sourceName ? { rich_text: [{ text: { content: payload.sourceName } }] } : { rich_text: [] },
      URL:        payload.sourceUrl ? { url: payload.sourceUrl } : { url: null },
      タグ:       { multi_select: payload.tags.map((t) => ({ name: t })) },
    },
  })

  return pageToEntry(page)
}
