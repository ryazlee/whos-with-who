import type { AttemptResult, ID } from '../datastore/types'
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

export function correctPartnerIdFromAttemptResult(
  result: Pick<AttemptResult, 'perPerson'>,
): Map<ID, ID | null> {
  return new Map(result.perPerson.map((row) => [row.personId, row.correctPartnerId]))
}

/** Prefer attempt result answer key; fall back to owner edit relationships. */
export function resolveCorrectPartnerIdByPerson(args: {
  attemptResult?: AttemptResult | null
  ownerRelationships?: DraftRelationships
}): Map<ID, ID | null> | undefined {
  if (args.attemptResult) {
    return correctPartnerIdFromAttemptResult(args.attemptResult)
  }
  if (args.ownerRelationships) {
    return answerKeyFromRelationships(args.ownerRelationships)
  }
  return undefined
}
