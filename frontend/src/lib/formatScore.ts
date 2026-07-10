import { isLegacyScore } from '../game/timedScoring'

/** Format stored score (tenths 0–1000, or legacy 0–100 integer). */
export function formatScore(score100: number, durationMs?: number | null): string {
  if (isLegacyScore(score100, durationMs)) {
    return String(score100)
  }
  const display = score100 / 10
  return Number.isInteger(display) ? String(display) : display.toFixed(1)
}

export function scoreDisplayPoints(score100: number, durationMs?: number | null): number {
  if (isLegacyScore(score100, durationMs)) return score100
  return score100 / 10
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min === 0) return `${sec}s`
  return `${min}m ${sec}s`
}
