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

export function hasPlayedGame(gameId: ID): boolean {
  return getCompletedAttemptForGame(gameId) !== null
}

export function saveAttemptResult(result: AttemptResult) {
  const byGame = readJson<Record<ID, GameAttemptRef>>(BY_GAME_KEY, {})
  byGame[result.gameId] = {
    attemptId: result.attemptId,
    gameId: result.gameId,
    score100: result.score100,
    completedAt: new Date().toISOString(),
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
