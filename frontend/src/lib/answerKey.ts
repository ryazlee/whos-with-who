import type { ID } from '../datastore/types'
import type { DraftRelationships } from '../components/RelationshipEditor'

export function answerKeyFromRelationships(
  relationships: DraftRelationships,
): Map<ID, ID | null> {
  return new Map(
    Object.entries(relationships).map(([personId, partnerId]) => [
      personId,
      partnerId === undefined ? null : partnerId,
    ]),
  )
}
