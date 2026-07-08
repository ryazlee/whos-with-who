import type {
  MatchAllCorrectness,
  MatchAllScoreResult,
} from './types'

export function computeMatchAllScore(args: {
  correctness: MatchAllCorrectness[]
  // null means explicit "Single"
  selections: Record<string, string | null>
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
  const accuracy = totalQuestions === 0 ? 0 : correctCount / totalQuestions
  const score100 = Math.round(100 * accuracy)

  return {
    correctCount,
    totalQuestions,
    score100,
    perPerson,
  }
}

