import type { DraftPerson, DraftRelationships } from '../components/RelationshipEditor'
import type { MatchingMode } from '../game/matchingModes'

export function relationshipsToGroups(
  people: DraftPerson[],
  relationships: DraftRelationships,
): string[][] {
  const named = people.filter((p) => p.name.trim())
  const groups: string[][] = []
  const seen = new Set<string>()

  for (const p of named) {
    if (seen.has(p.id)) continue
    const partner = relationships[p.id]
    if (partner === undefined) continue

    if (partner === null) {
      groups.push([p.id])
      seen.add(p.id)
    } else if (relationships[partner] === p.id) {
      groups.push([p.id, partner])
      seen.add(p.id)
      seen.add(partner)
    }
  }

  return groups
}

export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'game'
}

export function ensureUuid(id: string): string {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRe.test(id)) return id
  return crypto.randomUUID()
}

export type PublishGameInput = {
  title: string
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  people: DraftPerson[]
  relationships: DraftRelationships
}

export type PublishGameResult = {
  gameId: string
  slug: string
}
