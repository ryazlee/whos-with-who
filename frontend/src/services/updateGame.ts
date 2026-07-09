import type { DraftPerson, DraftRelationships } from '../components/RelationshipEditor'
import type { MatchingMode } from '../game/matchingModes'
import { normalizeAllowedModes } from '../game/matchingModes'
import { ensureSession } from '../lib/auth'
import {
  ensureUuid,
  relationshipsToGroups,
} from '../lib/publishGamePayload'
import { tagsToPayload } from '../lib/tagUtils'
import { uploadGamePersonImage } from '../lib/uploadGameImage'
import { supabase } from '../lib/supabaseClient'

export type GameForEdit = {
  gameId: string
  slug: string | null
  title: string
  description: string
  tags: string[]
  visibility: 'public' | 'unlisted'
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  allowedMatchingModes: MatchingMode[]
  people: DraftPerson[]
  relationships: DraftRelationships
}

export async function getGameForEdit(gameRef: string): Promise<GameForEdit> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  await ensureSession()

  const { data, error } = await supabase.rpc('get_game_for_edit', {
    p_game_ref: gameRef,
  })

  if (error) throw error

  const raw = data as Record<string, unknown>
  const peopleRaw = (raw.people as Array<{
    id: string
    name: string
    imageUrl: string
    sortOrder: number
  }>) ?? []

  const relationshipsRaw = (raw.relationships as Record<string, string | null>) ?? {}

  return {
    gameId: raw.gameId as string,
    slug: (raw.slug as string | null) ?? null,
    title: raw.title as string,
    description: (raw.description as string) ?? '',
    tags: (raw.tags as string[]) ?? [],
    visibility: raw.visibility as 'public' | 'unlisted',
    ownerMatchingMode: raw.matchingMode as MatchingMode,
    modeLocked: Boolean(raw.modeLocked),
    allowedMatchingModes: normalizeAllowedModes(raw.allowedMatchingModes as MatchingMode[]),
    people: peopleRaw.map((p) => ({
      id: p.id,
      name: p.name,
      photoDataUrl: p.imageUrl,
    })),
    relationships: relationshipsRaw,
  }
}

export async function updateGame(args: {
  gameRef: string
  title: string
  description: string
  tags: string[]
  visibility: 'public' | 'unlisted'
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  allowedMatchingModes: MatchingMode[]
  people: DraftPerson[]
  relationships: DraftRelationships
}): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const session = await ensureSession()
  const userId = session.user.id

  const named = args.people.filter((p) => p.name.trim() && p.photoDataUrl)
  if (named.length < 2) {
    throw new Error('Add at least two people with photos and names.')
  }

  const idMap = new Map<string, string>()
  for (const p of named) {
    idMap.set(p.id, ensureUuid(p.id))
  }

  const peoplePayload: Array<{
    id: string
    name: string
    image_url: string
    sort_order: number
  }> = []

  for (let i = 0; i < named.length; i++) {
    const p = named[i]
    const dbId = idMap.get(p.id)!
    const imageUrl = p.photoDataUrl!.startsWith('http')
      ? p.photoDataUrl!
      : await uploadGamePersonImage(userId, dbId, p.photoDataUrl!)

    peoplePayload.push({
      id: dbId,
      name: p.name.trim(),
      image_url: imageUrl,
      sort_order: i,
    })
  }

  const remappedRelationships: DraftRelationships = {}
  for (const p of named) {
    const partner = args.relationships[p.id]
    if (partner === undefined) continue
    if (partner === null) {
      remappedRelationships[idMap.get(p.id)!] = null
    } else if (idMap.has(partner)) {
      remappedRelationships[idMap.get(p.id)!] = idMap.get(partner)!
    }
  }

  const groups = relationshipsToGroups(
    named.map((p) => ({ ...p, id: idMap.get(p.id)! })),
    remappedRelationships,
  ).map((g) => ({ person_ids: g }))

  const covered = new Set(groups.flatMap((g) => g.person_ids))
  if (covered.size !== named.length) {
    throw new Error('Set a partner or single status for every person.')
  }

  const { error } = await supabase.rpc('update_game', {
    p_game_ref: args.gameRef,
    p_payload: {
      title: args.title.trim(),
      description: args.description.trim(),
      tags: tagsToPayload(args.tags),
      visibility: args.visibility,
      matching_mode: args.modeLocked
        ? args.ownerMatchingMode
        : (args.allowedMatchingModes[0] ?? 'tap_pairs'),
      mode_locked: args.modeLocked,
      allowed_matching_modes: args.allowedMatchingModes,
      people: peoplePayload,
      groups,
    },
  })

  if (error) throw error
}
