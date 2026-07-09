import type {
  AttemptResult,
  DailyChallenge,
  GameForPlay,
  GameSummary,
  ID,
  MatchAllSelections,
} from './types'
import type { WhoWithWhoDatastore } from './WhoWithWhoDatastore'
import { fetchGameSummaries } from './supabaseGameQueries'
import { ensureSession } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { saveAttemptResult, getCompletedAttemptForGame } from '../lib/localAttempts'
import type { MatchingMode } from '../game/matchingModes'
import { normalizeAllowedModes } from '../game/matchingModes'

function resolveImageUrl(url: string): string {
  if (url.startsWith('mock/')) {
    const base = import.meta.env.BASE_URL
    return `${base}${url}`
  }
  return url
}

function parseAttemptResult(raw: Record<string, unknown>): AttemptResult {
  const people = (raw.people as Array<{ id: string; name: string; imageUrl: string }>).map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: resolveImageUrl(p.imageUrl),
  }))

  return {
    attemptId: raw.attemptId as string,
    gameId: raw.gameId as string,
    people,
    displayNameSnapshot: raw.displayNameSnapshot as string,
    score100: raw.score100 as number,
    correctCount: raw.correctCount as number,
    totalQuestions: raw.totalQuestions as number,
    perPerson: raw.perPerson as AttemptResult['perPerson'],
    communityPerPerson: raw.communityPerPerson as AttemptResult['communityPerPerson'],
  }
}

async function resolveGameUuid(idOrSlug: ID): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRe.test(idOrSlug)) {
    const { data, error } = await supabase.from('games').select('id').eq('id', idOrSlug).maybeSingle()
    if (error) throw error
    if (data) return data.id
  }

  const { data, error } = await supabase.from('games').select('id').eq('slug', idOrSlug).maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Game not found')
  return data.id
}

class SupabaseWhoWithWhoDatastore implements WhoWithWhoDatastore {
  private sb() {
    if (!supabase) throw new Error('Supabase not configured')
    return supabase
  }

  private async authedClient() {
    await ensureSession()
    return this.sb()
  }

  async listPopularGames(): Promise<GameSummary[]> {
    const sb = this.sb()
    const summaries = await fetchGameSummaries(sb, { visibility: 'public' })
    return summaries.sort((a, b) => b.attemptCount - a.attemptCount)
  }

  async getDailyChallenge(): Promise<DailyChallenge> {
    const sb = this.sb()
    const today = new Date().toISOString().slice(0, 10)

    const { data: daily, error: dailyError } = await sb
      .from('daily_challenges')
      .select('date, game_id')
      .eq('date', today)
      .maybeSingle()

    if (dailyError) throw dailyError

    let gameId = daily?.game_id
    if (!gameId) {
      const { data: fallback } = await sb.from('games').select('id').eq('slug', 'demo').maybeSingle()
      gameId = fallback?.id
    }
    if (!gameId) throw new Error('No daily challenge')

    const summaries = await fetchGameSummaries(sb, { gameId })
    const game = summaries[0]
    if (!game) throw new Error('Daily game not found')

    return {
      date: daily?.date ?? today,
      game,
    }
  }

  async getGameSummary(gameId: ID): Promise<GameSummary> {
    const sb = this.sb()
    const uuid = await resolveGameUuid(gameId)
    const summaries = await fetchGameSummaries(sb, { gameId: uuid })
    const game = summaries[0]
    if (!game) throw new Error('Game not found')
    return game
  }

  async getGameForPlay(gameId: ID): Promise<GameForPlay> {
    const sb = this.sb()
    const uuid = await resolveGameUuid(gameId)

    const { data: game, error: gameError } = await sb
      .from('games')
      .select('id, title, matching_mode, mode_locked, allowed_matching_modes, creator_display_name')
      .eq('id', uuid)
      .not('published_at', 'is', null)
      .single()

    if (gameError) throw gameError

    const { data: people, error: peopleError } = await sb
      .from('game_people')
      .select('id, name, primary_image_url, sort_order')
      .eq('game_id', uuid)
      .order('sort_order')

    if (peopleError) throw peopleError

    const { data: allowSingle, error: allowError } = await sb.rpc('game_allows_singles', {
      p_game_id: uuid,
    })

    const allowSingleChoice = allowError ? true : Boolean(allowSingle)

    return {
      gameId,
      title: game.title,
      authorName: game.creator_display_name?.trim() || null,
      ownerMatchingMode: game.matching_mode as MatchingMode,
      modeLocked: game.mode_locked,
      allowedMatchingModes: normalizeAllowedModes(
        (game.allowed_matching_modes ?? []) as MatchingMode[],
      ),
      people: (people ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: resolveImageUrl(p.primary_image_url),
      })),
      allowSingleChoice,
    }
  }

  async submitMatchAllAttempt(args: {
    gameId: ID
    selections: MatchAllSelections
    displayNameSnapshot: string
  }): Promise<AttemptResult> {
    const sb = await this.authedClient()

    if (getCompletedAttemptForGame(args.gameId)) {
      throw new Error('You already played this game')
    }

    const answers = Object.entries(args.selections).map(([personId, selectedPartnerId]) => ({
      person_id: personId,
      selected_partner_id: selectedPartnerId,
    }))

    const { data, error } = await sb.rpc('submit_attempt', {
      p_game_id: args.gameId,
      p_answers: answers,
      p_display_name: args.displayNameSnapshot,
    })

    if (error) throw error

    const result = parseAttemptResult(data as Record<string, unknown>)
    saveAttemptResult({ ...result, gameId: args.gameId })
    return { ...result, gameId: args.gameId }
  }

  async getMyAttemptForGame(gameId: ID): Promise<AttemptResult | null> {
    const local = getCompletedAttemptForGame(gameId)
    if (local) {
      try {
        return await this.getAttemptResult(local.attemptId)
      } catch {
        // fall through to Supabase lookup
      }
    }

    try {
      const sb = this.sb()
      const uuid = await resolveGameUuid(gameId)
      const { data: sessionData } = await sb.auth.getSession()
      const userId = sessionData.session?.user.id
      if (!userId) return null

      const { data: attempt, error } = await sb
        .from('game_attempts')
        .select('id')
        .eq('game_id', uuid)
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !attempt) return null
      return await this.getAttemptResult(attempt.id)
    } catch {
      return null
    }
  }

  async getAttemptResult(attemptId: ID): Promise<AttemptResult> {
    const sb = await this.authedClient()

    const { data, error } = await sb.rpc('get_attempt_result', {
      p_attempt_id: attemptId,
    })

    if (error) throw error
    return parseAttemptResult(data as Record<string, unknown>)
  }
}

export const supabaseDatastore: WhoWithWhoDatastore = new SupabaseWhoWithWhoDatastore()
