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
  allowedMatchingModes: MatchingMode[]
  authorName: string | null
  /** ISO timestamp when the game was published (null if draft). */
  publishedAt: string | null
  /** First few people for feed avatars (ordered). */
  previewPeople: Array<{ id: ID; name: string; imageUrl: string }>
}

export type DailyChallenge = {
  date: string
  game: GameSummary
}

export type GameForPlay = {
  gameId: ID
  title: string
  authorName: string | null
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  allowedMatchingModes: MatchingMode[]
  people: Person[]
  allowSingleChoice: boolean
  /** People who are correctly single in this game (from creator relationships). */
  singleCount: number
}

export type MatchAllSelections = Record<ID, ID | null>

export type CommunityGuessPick = {
  partnerId: ID | null
  percent: number
  count?: number
}

export type CommunityPerPerson = Array<{
  personId: ID
  /** All crowd guesses for this person, highest % first. */
  picks?: CommunityGuessPick[]
  topPartnerId?: ID | null
  topPercent?: number
  singlePercent?: number
}>

export type LeaderboardEntry = {
  attemptId: ID
  displayName: string
  score100: number
  correctCount: number
  rank: number
}

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
