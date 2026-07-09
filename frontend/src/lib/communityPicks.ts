import type { CommunityPerPerson, ID } from '../datastore/types'

export type FlatCommunityPick = {
  personId: ID
  partnerId: ID | null
  percent: number
  count?: number
}

export function normalizeCommunityPicks(row: CommunityPerPerson[number]): FlatCommunityPick[] {
  if (row.picks && row.picks.length > 0) {
    return row.picks.map((pick) => ({
      personId: row.personId,
      partnerId: pick.partnerId,
      percent: pick.percent,
      count: pick.count,
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

function pairingKey(personId: ID, partnerId: ID | null): string {
  if (partnerId === null) return `single:${personId}`
  return [personId, partnerId].sort().join(':')
}

function canonicalizeCommunityPick(pick: FlatCommunityPick): FlatCommunityPick {
  if (pick.partnerId === null) return pick
  const [personId, partnerId] = [pick.personId, pick.partnerId].sort()
  return {
    personId,
    partnerId,
    percent: pick.percent,
    count: pick.count,
  }
}

function pickRank(pick: FlatCommunityPick): [number, number] {
  return [pick.count ?? 0, pick.percent]
}

function shouldReplacePick(existing: FlatCommunityPick, candidate: FlatCommunityPick): boolean {
  const [existingCount, existingPercent] = pickRank(existing)
  const [candidateCount, candidatePercent] = pickRank(candidate)
  if (candidateCount !== existingCount) return candidateCount > existingCount
  return candidatePercent > existingPercent
}

/** Collapse mutual pair rows (A→B and B→A) into a single entry. */
export function dedupeCommunityPicks(picks: FlatCommunityPick[]): FlatCommunityPick[] {
  const byKey = new Map<string, FlatCommunityPick>()

  for (const pick of picks) {
    const canonical = canonicalizeCommunityPick(pick)
    const key = pairingKey(canonical.personId, canonical.partnerId)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, canonical)
      continue
    }

    const mergedCount = Math.max(existing.count ?? 0, canonical.count ?? 0)
    const winner = shouldReplacePick(existing, canonical) ? canonical : existing
    byKey.set(key, {
      ...winner,
      count: mergedCount || winner.count,
    })
  }

  return [...byKey.values()]
}

export function sortCommunityPicksByFrequency(picks: FlatCommunityPick[]): FlatCommunityPick[] {
  return [...picks].sort((a, b) => {
    const countDiff = (b.count ?? 0) - (a.count ?? 0)
    if (countDiff !== 0) return countDiff
    const percentDiff = b.percent - a.percent
    if (percentDiff !== 0) return percentDiff
    return a.personId.localeCompare(b.personId)
  })
}

export function sortedCommunityPicks(data: CommunityPerPerson): FlatCommunityPick[] {
  return sortCommunityPicksByFrequency(dedupeCommunityPicks(flattenCommunityPicks(data)))
}

export function topCommunityPicks(data: CommunityPerPerson, limit = 5): FlatCommunityPick[] {
  return sortedCommunityPicks(data).slice(0, limit)
}

export function isCommunityPickCorrect(
  personId: ID,
  partnerId: ID | null,
  correctPartnerIdByPerson?: Map<ID, ID | null>,
): boolean | null {
  if (!correctPartnerIdByPerson) return null

  if (partnerId === null) {
    if (!correctPartnerIdByPerson.has(personId)) return null
    return correctPartnerIdByPerson.get(personId) === null
  }

  const aCorrect = correctPartnerIdByPerson.get(personId)
  const bCorrect = correctPartnerIdByPerson.get(partnerId)
  if (aCorrect === undefined && bCorrect === undefined) return null

  return aCorrect === partnerId || bCorrect === personId
}
