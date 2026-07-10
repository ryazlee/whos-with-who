export type Person = {
  id: string
  name: string
  imageUrl: string
}

// For match_all v1: each person is either paired with exactly one partner, or single.
export type MatchAllCorrectness = {
  personId: string
  correctPartnerId: string | null
}

export type MatchAllSelection = {
  // null means explicit "Single" choice
  selectedPartnerId: string | null
}

export type MatchAllScoreResult = {
  correctCount: number
  totalQuestions: number
  score100: number
  durationMs?: number
  perPerson: Array<{
    personId: string
    correctPartnerId: string | null
    selectedPartnerId: string | null
    isCorrect: boolean
  }>
}

