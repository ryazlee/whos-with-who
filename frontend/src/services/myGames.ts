import type { GameSummary } from '../datastore/types'
import { fetchGameSummaries } from '../datastore/supabaseGameQueries'
import { ensureSession } from '../lib/auth'
import { tagsToPayload } from '../lib/tagUtils'
import { supabase } from '../lib/supabaseClient'

export async function listMyGames(): Promise<GameSummary[]> {
  if (!supabase) return []

  const session = await ensureSession()
  return fetchGameSummaries(supabase, { creatorId: session.user.id })
}

export async function updateGameVisibility(
  gameRef: string,
  visibility: 'public' | 'unlisted',
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  await ensureSession()

  const { error } = await supabase.rpc('update_game_visibility', {
    p_game_ref: gameRef,
    p_visibility: visibility,
  })

  if (error) throw error
}

export async function updateGameDetails(
  gameRef: string,
  description: string,
  tags: string[],
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  await ensureSession()

  const { error } = await supabase.rpc('update_game_details', {
    p_game_ref: gameRef,
    p_description: description.trim(),
    p_tags: tagsToPayload(tags),
  })

  if (error) throw error
}

export async function deleteGame(gameRef: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  await ensureSession()

  const { error } = await supabase.rpc('delete_game', {
    p_game_ref: gameRef,
  })

  if (error) throw error
}
