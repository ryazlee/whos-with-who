import type { AttemptResult, MatchAllSelections } from '../datastore/types'

export function selectionsFromAttemptResult(result: AttemptResult): MatchAllSelections {
  const selections: MatchAllSelections = {}
  for (const row of result.perPerson) {
    selections[row.personId] = row.selectedPartnerId
  }
  return selections
}
