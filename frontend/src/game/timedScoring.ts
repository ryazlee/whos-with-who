/** Accuracy share of the score (remainder is speed within the same correct-count tier). */
export const ACCURACY_SCORE_WEIGHT = 0.9
export const TIME_SCORE_WEIGHT = 0.1

/** Stored score uses tenths (0–1000) so time can differentiate without crossing tiers. */
export const SCORE_TENTHS_MAX = 1000

const MS_PER_PERSON = 30_000
const MIN_TARGET_MS = 45_000

export function scoringTargetMs(totalQuestions: number): number {
  return Math.max(MIN_TARGET_MS, totalQuestions * MS_PER_PERSON)
}

export function timeRatio(durationMs: number, totalQuestions: number): number {
  const target = scoringTargetMs(totalQuestions)
  if (target <= 0) return 1
  return Math.max(0, 1 - Math.min(1, durationMs / target))
}

/**
 * Correctness dominates; speed adds up to 10% within the same correct-count band.
 * Returns score in tenths (0–1000) — display with formatScore().
 */
export function computeTimedScoreTenths(args: {
  correctCount: number
  totalQuestions: number
  durationMs: number
}): number {
  const { correctCount, totalQuestions, durationMs } = args
  if (totalQuestions <= 0) return 0

  const accuracyTenths = (1000 * correctCount) / totalQuestions
  const ratio = timeRatio(durationMs, totalQuestions)
  const scoreTenths = accuracyTenths * (ACCURACY_SCORE_WEIGHT + TIME_SCORE_WEIGHT * ratio)

  return Math.min(SCORE_TENTHS_MAX, Math.max(0, Math.round(scoreTenths)))
}

export function isLegacyScore(score100: number, durationMs?: number | null): boolean {
  return durationMs == null && score100 <= 100
}

/** Compare scores for sorting (higher is better). */
export function compareScores(
  a: { score100: number; durationMs?: number | null },
  b: { score100: number; durationMs?: number | null },
): number {
  if (b.score100 !== a.score100) return b.score100 - a.score100
  const aDur = a.durationMs ?? Number.MAX_SAFE_INTEGER
  const bDur = b.durationMs ?? Number.MAX_SAFE_INTEGER
  return aDur - bDur
}
