import type { SavedResult } from '@/types'

const STORAGE_KEY = 'ta_compass_history'

export function getHistory(): SavedResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedResult[]) : []
  } catch {
    return []
  }
}

export function saveResult(result: SavedResult): void {
  const history = getHistory()
  const idx = history.findIndex((r) => r.id === result.id)
  if (idx >= 0) history[idx] = result
  else history.unshift(result)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function deleteResult(id: string): void {
  const next = getHistory().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
