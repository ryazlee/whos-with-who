import type {
  AttemptResult,
  DailyChallenge,
  GameForPlay,
  GameSummary,
  ID,
  MatchAllSelections,
} from '../datastore/types'
import { mockDatastore } from '../datastore/mockDatastore'
import { supabaseDatastore } from '../datastore/supabaseDatastore'
import type { WhoWithWhoDatastore } from '../datastore/WhoWithWhoDatastore'
import { supabase } from '../lib/supabaseClient'

export const isSupabaseEnabled = Boolean(supabase)

const datastore: WhoWithWhoDatastore = isSupabaseEnabled ? supabaseDatastore : mockDatastore

export async function listPopularGames(): Promise<GameSummary[]> {
  return datastore.listPopularGames()
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  return datastore.getDailyChallenge()
}

export async function getGameSummary(gameId: ID): Promise<GameSummary> {
  return datastore.getGameSummary(gameId)
}

export async function getGameForPlay(gameId: ID): Promise<GameForPlay> {
  return datastore.getGameForPlay(gameId)
}

export async function submitMatchAllAttempt(args: {
  gameId: ID
  selections: MatchAllSelections
  displayNameSnapshot: string
}): Promise<AttemptResult> {
  return datastore.submitMatchAllAttempt(args)
}

export async function getAttemptResult(attemptId: ID): Promise<AttemptResult> {
  return datastore.getAttemptResult(attemptId)
}

export async function getMyAttemptForGame(gameId: ID): Promise<AttemptResult | null> {
  return datastore.getMyAttemptForGame(gameId)
}
