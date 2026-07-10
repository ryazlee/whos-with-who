import { useMemo } from 'react'
import type { DraftRelationships } from '../components/RelationshipEditor'
import type { AttemptResult } from '../datastore/types'
import { resolveCorrectPartnerIdByPerson } from '../lib/answerKey'

/** Builds the answer key map for community pick highlighting on stats pages. */
export function useCorrectPartnerIdByPerson(args: {
  attemptResult?: AttemptResult | null
  ownerRelationships?: DraftRelationships
}) {
  return useMemo(
    () =>
      resolveCorrectPartnerIdByPerson({
        attemptResult: args.attemptResult,
        ownerRelationships: args.ownerRelationships,
      }),
    [args.attemptResult, args.ownerRelationships],
  )
}
