import type {
  MatchAllCorrectness,
  MatchAllScoreResult,
} from './types'
import { computeTimedScoreTenths } from './timedScoring'

export function computeMatchAllScore(args: {
  correctness: MatchAllCorrectness[]
  // null means explicit "Single"
  selections: Record<string, string | null>
  durationMs?: number
}): MatchAllScoreResult {
  const perPerson: MatchAllScoreResult['perPerson'] = []

  let correctCount = 0

  for (const c of args.correctness) {
    const selectedPartnerId = args.selections[c.personId]
    if (selectedPartnerId === undefined) {
      // Missing selection => not correct.
      perPerson.push({
        personId: c.personId,
        correctPartnerId: c.correctPartnerId,
        selectedPartnerId: null,
        isCorrect: false,
      })
      continue
    }

    const isCorrect = selectedPartnerId === c.correctPartnerId
    if (isCorrect) correctCount += 1

    perPerson.push({
      personId: c.personId,
      correctPartnerId: c.correctPartnerId,
      selectedPartnerId: selectedPartnerId,
      isCorrect,
    })
  }

  const totalQuestions = args.correctness.length
  const score100 =
    args.durationMs != null
      ? computeTimedScoreTenths({
          correctCount,
          totalQuestions,
          durationMs: args.durationMs,
        })
      : totalQuestions === 0
        ? 0
        : Math.round((1000 * correctCount) / totalQuestions)

  return {
    correctCount,
    totalQuestions,
    score100,
    durationMs: args.durationMs,
    perPerson,
  }
}

