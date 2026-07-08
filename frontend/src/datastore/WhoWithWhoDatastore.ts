import type {
  AttemptResult,
  DailyChallenge,
  GameForPlay,
  GameSummary,
  ID,
  MatchAllSelections,
} from './types'

export interface WhoWithWhoDatastore {
  listPopularGames(): Promise<GameSummary[]>

  getDailyChallenge(): Promise<DailyChallenge>

  getGameSummary(gameId: ID): Promise<GameSummary>

  /**
   * Loads game content needed to render the gameplay UI.
   * (For real Supabase later, correctness details should not be sent to clients.)
   */
  getGameForPlay(gameId: ID): Promise<GameForPlay>

  submitMatchAllAttempt(args: {
    gameId: ID
    selections: MatchAllSelections
    displayNameSnapshot: string
  }): Promise<AttemptResult>

  /** Returns this player's prior attempt for a game, if any. */
  getMyAttemptForGame(gameId: ID): Promise<AttemptResult | null>

  getAttemptResult(attemptId: ID): Promise<AttemptResult>
}

