import type { MatchingMode } from '../game/matchingModes'
import type { Person } from '../game/types'

export type ID = string

export type GameSummary = {
  id: ID
  title: string
  description: string
  tags: string[]
  visibility: 'public' | 'unlisted'
  attemptCount: number
  peopleCount: number
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  /** First few people for feed avatars (ordered). */
  previewPeople: Array<{ id: ID; name: string; imageUrl: string }>
}

export type DailyChallenge = {
  date: string
  game: GameSummary
}

export type GameForPlay = {
  gameId: ID
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  people: Person[]
  allowSingleChoice: boolean
}

export type MatchAllSelections = Record<ID, ID | null>

export type CommunityPerPerson = Array<{
  personId: ID
  topPartnerId: ID | null
  topPercent: number
  singlePercent: number
}>

export type AttemptResult = {
  attemptId: ID
  gameId: ID
  people: Person[]
  displayNameSnapshot: string
  score100: number
  correctCount: number
  totalQuestions: number
  perPerson: Array<{
    personId: ID
    correctPartnerId: ID | null
    selectedPartnerId: ID | null
    isCorrect: boolean
  }>
  communityPerPerson: CommunityPerPerson
}
