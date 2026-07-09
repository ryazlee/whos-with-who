import type { MatchAllSelections } from '../datastore/types'

export type TapPairAssignment = ID | 'single' | null
type ID = string

/** Mutual pair: a↔b. Single: 'single'. Unassigned: null. */
export function setPair(
  assigned: Record<ID, TapPairAssignment>,
  a: ID,
  b: ID,
): Record<ID, TapPairAssignment> {
  const next = { ...assigned }
  clearPerson(next, a)
  clearPerson(next, b)
  next[a] = b
  next[b] = a
  return next
}

export function setSingle(
  assigned: Record<ID, TapPairAssignment>,
  personId: ID,
): Record<ID, TapPairAssignment> {
  const next = { ...assigned }
  clearPerson(next, personId)
  next[personId] = 'single'
  return next
}

export function clearPerson(assigned: Record<ID, TapPairAssignment>, personId: ID) {
  const cur = assigned[personId]
  if (cur && cur !== 'single') {
    const partnerId = cur
    if (assigned[partnerId] === personId) {
      assigned[partnerId] = null
    }
  }
  assigned[personId] = null
}

export function isComplete(
  peopleIds: ID[],
  assigned: Record<ID, TapPairAssignment>,
  allowSingleChoice: boolean,
): boolean {
  for (const id of peopleIds) {
    const v = assigned[id]
    if (v === null || v === undefined) return false
    if (v === 'single' && !allowSingleChoice) return false
    if (typeof v === 'string' && v !== 'single') {
      if (assigned[v] !== id) return false
    }
  }
  return true
}

export function selectionsToTapPairAssigned(
  peopleIds: ID[],
  selections: MatchAllSelections,
): Record<ID, TapPairAssignment> {
  const assigned: Record<ID, TapPairAssignment> = {}
  for (const id of peopleIds) assigned[id] = null
  for (const id of peopleIds) {
    if (!(id in selections)) continue
    const v = selections[id]
    if (v === null) {
      assigned[id] = 'single'
    } else if (v) {
      assigned[id] = v
      assigned[v] = id
    }
  }
  return assigned
}

export function tapPairsToSelections(
  peopleIds: ID[],
  assigned: Record<ID, TapPairAssignment>,
): MatchAllSelections {
  const selections: MatchAllSelections = {}
  for (const id of peopleIds) {
    const v = assigned[id]
    if (v === 'single') {
      selections[id] = null
    } else if (typeof v === 'string') {
      selections[id] = v
    }
    // Unassigned (null) — omit from selections so they are not treated as singles.
  }
  return selections
}

export type PairingProgressCounts = {
  pairCount: number
  singleCount: number
  assigned: number
}

/** Mutual pairs + explicit singles only (never unassigned). */
export function countPairingProgress(
  peopleIds: ID[],
  assigned: Record<ID, TapPairAssignment>,
): PairingProgressCounts {
  let pairCount = 0
  let singleCount = 0
  const seen = new Set<ID>()

  for (const id of peopleIds) {
    if (seen.has(id)) continue
    const v = assigned[id]
    if (v === 'single') {
      singleCount += 1
      seen.add(id)
    } else if (typeof v === 'string') {
      if (assigned[v] === id) {
        pairCount += 1
        seen.add(id)
        seen.add(v)
      }
    }
  }

  return {
    pairCount,
    singleCount,
    assigned: pairCount * 2 + singleCount,
  }
}

export function countMatchAllProgress(
  peopleIds: ID[],
  selections: MatchAllSelections,
): PairingProgressCounts {
  return countPairingProgress(peopleIds, selectionsToTapPairAssigned(peopleIds, selections))
}

export function gamePairingShape(totalPeople: number, singlesInGame: number) {
  const singleCount = Math.max(0, Math.min(totalPeople, singlesInGame))
  return {
    singleCount,
    pairCount: Math.max(0, (totalPeople - singleCount) / 2),
  }
}

export function matchAllComplete(
  peopleIds: ID[],
  selections: MatchAllSelections,
  allowSingleChoice: boolean,
): boolean {
  for (const id of peopleIds) {
    if (!(id in selections)) return false
    const partner = selections[id]
    if (partner && selections[partner] !== id) return false
    if (partner === null && !allowSingleChoice) return false
  }
  return true
}

/** IDs in confirmed mutual pairs or marked single. */
export function takenPeopleIds(
  peopleIds: ID[],
  selections: MatchAllSelections,
  treatNullAsTaken: boolean,
): Set<ID> {
  const taken = new Set<ID>()
  for (const id of peopleIds) {
    if (taken.has(id)) continue
    const partner = selections[id]
    if (partner && selections[partner] === id) {
      taken.add(id)
      taken.add(partner)
    } else if (treatNullAsTaken && partner === null && id in selections) {
      taken.add(id)
    }
  }
  return taken
}

export function availablePartnerIds(
  personId: ID,
  peopleIds: ID[],
  selections: MatchAllSelections,
): ID[] {
  const myPartner = selections[personId]
  const taken = takenPeopleIds(peopleIds, selections, true)

  return peopleIds.filter((id) => {
    if (id === personId) return false
    if (id === myPartner) return true
    return !taken.has(id)
  })
}

/** Set partner with mutual pairing. null = single. */
export function setMatchAllPartner(
  selections: MatchAllSelections,
  personId: ID,
  partnerId: ID | null,
): MatchAllSelections {
  const next: MatchAllSelections = { ...selections }

  const oldPartner = next[personId]
  if (oldPartner && next[oldPartner] === personId) {
    delete next[oldPartner]
  }

  if (partnerId === null) {
    next[personId] = null
    return next
  }

  const partnersOld = next[partnerId]
  if (partnersOld && partnersOld !== personId && next[partnersOld] === partnerId) {
    delete next[partnersOld]
  }

  next[personId] = partnerId
  next[partnerId] = personId

  return next
}

export function clearMatchAllPair(
  selections: MatchAllSelections,
  personId: ID,
): MatchAllSelections {
  const next = { ...selections }
  const partner = next[personId]
  delete next[personId]
  if (partner && next[partner] === personId) {
    delete next[partner]
  }
  return next
}
