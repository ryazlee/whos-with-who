import type { AttemptResult, ID } from '../datastore/types'

const BY_GAME_KEY = 'www_attempt_by_game'
const RESULTS_KEY = 'www_attempt_results'

export type GameAttemptRef = {
  attemptId: ID
  gameId: ID
  score100: number
  completedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getCompletedAttemptForGame(gameId: ID): GameAttemptRef | null {
  const map = readJson<Record<ID, GameAttemptRef>>(BY_GAME_KEY, {})
  return map[gameId] ?? null
}

/** Match by localStorage key or stored game id (slug vs uuid). */
export function findCompletedAttemptForRef(gameRef: ID): GameAttemptRef | null {
  const direct = getCompletedAttemptForGame(gameRef)
  if (direct) return direct

  const map = readJson<Record<ID, GameAttemptRef>>(BY_GAME_KEY, {})
  return Object.values(map).find((ref) => ref.gameId === gameRef) ?? null
}

export function listCompletedGameAttempts(): GameAttemptRef[] {
  const map = readJson<Record<ID, GameAttemptRef>>(BY_GAME_KEY, {})
  return Object.values(map).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )
}

export function hasPlayedGame(gameId: ID): boolean {
  return getCompletedAttemptForGame(gameId) !== null
}

export function saveAttemptResult(result: AttemptResult, playGameRef?: ID) {
  const ref: GameAttemptRef = {
    attemptId: result.attemptId,
    gameId: result.gameId,
    score100: result.score100,
    completedAt: new Date().toISOString(),
  }

  const byGame = readJson<Record<ID, GameAttemptRef>>(BY_GAME_KEY, {})
  byGame[result.gameId] = ref
  if (playGameRef && playGameRef !== result.gameId) {
    byGame[playGameRef] = ref
  }
  writeJson(BY_GAME_KEY, byGame)

  const results = readJson<Record<ID, AttemptResult>>(RESULTS_KEY, {})
  results[result.attemptId] = result
  writeJson(RESULTS_KEY, results)
}

export function getLocalAttemptResult(attemptId: ID): AttemptResult | null {
  const results = readJson<Record<ID, AttemptResult>>(RESULTS_KEY, {})
  return results[attemptId] ?? null
}
