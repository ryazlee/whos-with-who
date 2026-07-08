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
    if (v === 'single' || v === null) {
      selections[id] = null
    } else {
      selections[id] = v
    }
  }
  return selections
}
