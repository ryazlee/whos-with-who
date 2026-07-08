import type { DraftPerson, DraftRelationships } from '../components/RelationshipEditor'
import type { MatchingMode } from '../game/matchingModes'
import { ensureSession } from '../lib/auth'
import {
  ensureUuid,
  relationshipsToGroups,
  slugifyTitle,
  type PublishGameResult,
} from '../lib/publishGamePayload'
import { uploadGamePersonImage } from '../lib/uploadGameImage'
import { supabase } from '../lib/supabaseClient'

export type { PublishGameResult }

export async function publishGame(args: {
  title: string
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  people: DraftPerson[]
  relationships: DraftRelationships
}): Promise<PublishGameResult> {
  if (!supabase) {
    throw new Error('Publishing requires Supabase. Add env vars or use mock mode locally.')
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

  const slug = `${slugifyTitle(args.title)}-${crypto.randomUUID().slice(0, 8)}`

  const { data, error } = await supabase.rpc('publish_game', {
    p_payload: {
      title: args.title.trim(),
      slug,
      visibility: 'public',
      matching_mode: args.ownerMatchingMode,
      mode_locked: args.modeLocked,
      people: peoplePayload,
      groups,
    },
  })

  if (error) throw error

  const result = data as { gameId: string; slug: string }
  return { gameId: result.slug ?? result.gameId, slug: result.slug }
}
