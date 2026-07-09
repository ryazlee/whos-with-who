import type { CommunityPerPerson, ID } from '../datastore/types'

export type FlatCommunityPick = {
  personId: ID
  partnerId: ID | null
  percent: number
}

export function normalizeCommunityPicks(row: CommunityPerPerson[number]): FlatCommunityPick[] {
  if (row.picks && row.picks.length > 0) {
    return row.picks.map((pick) => ({
      personId: row.personId,
      partnerId: pick.partnerId,
      percent: pick.percent,
    }))
  }

  if (row.topPartnerId !== undefined || row.topPercent !== undefined) {
    return [
      {
        personId: row.personId,
        partnerId: row.topPartnerId ?? null,
        percent: row.topPercent ?? 0,
      },
    ]
  }

  return []
}

export function flattenCommunityPicks(data: CommunityPerPerson): FlatCommunityPick[] {
  return data.flatMap((row) => normalizeCommunityPicks(row))
}

export function topCommunityPicks(data: CommunityPerPerson, limit = 5): FlatCommunityPick[] {
  return [...flattenCommunityPicks(data)]
    .sort((a, b) => b.percent - a.percent || a.personId.localeCompare(b.personId))
    .slice(0, limit)
}

export function isCommunityPickCorrect(
  personId: ID,
  partnerId: ID | null,
  correctPartnerIdByPerson?: Map<ID, ID | null>,
): boolean | null {
  if (!correctPartnerIdByPerson) return null
  if (!correctPartnerIdByPerson.has(personId)) return null
  const correct = correctPartnerIdByPerson.get(personId) ?? null
  return partnerId === correct || (partnerId === null && correct === null)
}
