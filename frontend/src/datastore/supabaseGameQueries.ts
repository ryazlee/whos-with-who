import type { SupabaseClient } from '@supabase/supabase-js'
import type { MatchingMode } from '../game/matchingModes'
import type { GameSummary, ID } from './types'

type GameRow = {
  id: string
  slug: string | null
  title: string
  description: string
  visibility: string
  matching_mode: string
  mode_locked: boolean
}

function resolveImageUrl(url: string): string {
  if (url.startsWith('mock/')) {
    const base = import.meta.env.BASE_URL
    return `${base}${url}`
  }
  return url
}

export async function fetchGameSummaries(
  sb: SupabaseClient,
  opts?: { gameId?: string; visibility?: 'public' | 'unlisted' },
): Promise<GameSummary[]> {
  let query = sb
    .from('games')
    .select('id, slug, title, description, visibility, matching_mode, mode_locked')
    .not('published_at', 'is', null)

  if (opts?.visibility) {
    query = query.eq('visibility', opts.visibility)
  }
  if (opts?.gameId) {
    query = query.eq('id', opts.gameId)
  }

  const { data: games, error: gamesError } = await query
  if (gamesError) throw gamesError
  if (!games?.length) return []

  const gameRows = games as GameRow[]
  const gameIds = gameRows.map((g) => g.id)

  const [
    { data: people, error: peopleError },
    { data: tagRows, error: tagsError },
    { data: attempts, error: attemptsError },
  ] = await Promise.all([
    sb
      .from('game_people')
      .select('game_id, id, name, primary_image_url, sort_order')
      .in('game_id', gameIds)
      .order('sort_order'),
    sb.from('game_tags').select('game_id, tags ( slug )').in('game_id', gameIds),
    sb.from('game_attempts').select('game_id').in('game_id', gameIds),
  ])

  if (peopleError) throw peopleError
  if (tagsError) throw tagsError
  if (attemptsError) throw attemptsError

  const peopleByGame = new Map<string, Array<{ id: string; name: string; imageUrl: string }>>()
  for (const p of people ?? []) {
    const list = peopleByGame.get(p.game_id) ?? []
    list.push({
      id: p.id,
      name: p.name,
      imageUrl: resolveImageUrl(p.primary_image_url),
    })
    peopleByGame.set(p.game_id, list)
  }

  const tagsByGame = new Map<string, string[]>()
  for (const row of tagRows ?? []) {
    const tag = row.tags as { slug: string } | { slug: string }[] | null
    const slug = Array.isArray(tag) ? tag[0]?.slug : tag?.slug
    if (!slug) continue
    const list = tagsByGame.get(row.game_id) ?? []
    list.push(slug)
    tagsByGame.set(row.game_id, list)
  }

  const attemptCountByGame = new Map<string, number>()
  for (const a of attempts ?? []) {
    attemptCountByGame.set(a.game_id, (attemptCountByGame.get(a.game_id) ?? 0) + 1)
  }

  return gameRows.map((g) => {
    const previewPeople = peopleByGame.get(g.id) ?? []
    return {
      id: (g.slug ?? g.id) as ID,
      title: g.title,
      description: g.description ?? '',
      tags: (tagsByGame.get(g.id) ?? []).sort(),
      visibility: g.visibility as GameSummary['visibility'],
      attemptCount: attemptCountByGame.get(g.id) ?? 0,
      peopleCount: previewPeople.length,
      ownerMatchingMode: g.matching_mode as MatchingMode,
      modeLocked: g.mode_locked,
      previewPeople: previewPeople.slice(0, 5),
    }
  })
}
