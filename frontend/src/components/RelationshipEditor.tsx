import { Box, Stack, Typography } from '@mui/material'
import {
  PairingProgress,
  PairingSection,
  PairResultRow,
  PartnerPickerRow,
  RemainingPeopleRow,
  SingleResultRow,
  type PairingPerson,
} from './PairingUI'

export type DraftPerson = {
  id: string
  name: string
  photoDataUrl: string | null
}

/** undefined = not set yet, null = single, string = partner id */
export type DraftRelationships = Record<string, string | null | undefined>

function toPairingPerson(p: DraftPerson): PairingPerson {
  return { id: p.id, name: p.name.trim(), imageUrl: p.photoDataUrl }
}

export function syncRelationshipsForPeople(
  people: DraftPerson[],
  prev: DraftRelationships,
): DraftRelationships {
  const next: DraftRelationships = {}
  const ids = new Set(people.map((p) => p.id))
  for (const p of people) {
    if (!(p.id in prev)) {
      next[p.id] = undefined
      continue
    }
    const cur = prev[p.id]
    if (cur && ids.has(cur)) next[p.id] = cur
    else if (cur === null) next[p.id] = null
    else next[p.id] = undefined
  }
  for (const p of people) {
    const partner = next[p.id]
    if (partner && next[partner] !== p.id) {
      next[partner] = p.id
    }
  }
  return next
}

export function setPartner(
  relationships: DraftRelationships,
  personId: string,
  partnerId: string | null,
): DraftRelationships {
  const next = { ...relationships }

  const oldPartner = next[personId]
  if (oldPartner && next[oldPartner] === personId) {
    next[oldPartner] = undefined
  }

  next[personId] = partnerId

  if (partnerId) {
    const partnersOld = next[partnerId]
    if (partnersOld && partnersOld !== personId && next[partnersOld] === partnerId) {
      next[partnersOld] = undefined
    }
    next[partnerId] = personId
  }

  return next
}

export function unpair(
  relationships: DraftRelationships,
  personId: string,
  partnerId: string,
): DraftRelationships {
  const next = { ...relationships }
  next[personId] = undefined
  next[partnerId] = undefined
  return next
}

export function unassignSingle(relationships: DraftRelationships, personId: string): DraftRelationships {
  return { ...relationships, [personId]: undefined }
}

export function relationshipsComplete(people: DraftPerson[], relationships: DraftRelationships): boolean {
  if (people.length < 2) return false
  for (const p of people) {
    const partner = relationships[p.id]
    if (partner === undefined) return false
    if (partner !== null && partner !== p.id && relationships[partner] !== p.id) return false
  }
  return true
}

export function hasSingles(relationships: DraftRelationships): boolean {
  return Object.values(relationships).some((v) => v === null)
}

function partitionPeople(people: DraftPerson[], relationships: DraftRelationships) {
  const named = people.filter((p) => p.name.trim())
  const unassigned: DraftPerson[] = []
  const singles: DraftPerson[] = []
  const pairs: Array<[DraftPerson, DraftPerson]> = []
  const seen = new Set<string>()

  for (const p of named) {
    if (seen.has(p.id)) continue
    const v = relationships[p.id]
    if (v === undefined) {
      unassigned.push(p)
      seen.add(p.id)
    } else if (v === null) {
      singles.push(p)
      seen.add(p.id)
    } else {
      const partner = named.find((x) => x.id === v)
      if (partner && relationships[v] === p.id) {
        pairs.push([p, partner])
        seen.add(p.id)
        seen.add(partner.id)
      } else {
        unassigned.push(p)
        seen.add(p.id)
      }
    }
  }

  return { named, unassigned, singles, pairs }
}

type Props = {
  people: DraftPerson[]
  relationships: DraftRelationships
  onChange: (relationships: DraftRelationships) => void
}

export default function RelationshipEditor({ people, relationships, onChange }: Props) {
  const { named, unassigned, singles, pairs } = partitionPeople(people, relationships)
  const assignedCount = pairs.length * 2 + singles.length
  const unassignedPeople = unassigned.map(toPairingPerson)

  if (named.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Add at least two people with names to set couples.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      <PairingProgress
        total={named.length}
        assigned={assignedCount}
        hint="Set each person's partner or mark them single"
      />

      {unassigned.length > 0 ? (
        <PairingSection
          title={unassigned.length === 1 ? 'Last person' : 'Match people'}
          subtitle="Pick a partner — they'll both leave this list"
        >
          {unassigned.length > 1 ? (
            <Box sx={{ px: 1.5, py: 1.1 }}>
              <RemainingPeopleRow people={unassignedPeople} />
            </Box>
          ) : null}
          {unassigned.map((person) => {
            const options = unassigned
              .filter((p) => p.id !== person.id)
              .map(toPairingPerson)

            return (
              <PartnerPickerRow
                key={person.id}
                person={toPairingPerson(person)}
                options={options}
                allowSingle
                value=""
                onSelect={(partnerId) => onChange(setPartner(relationships, person.id, partnerId))}
              />
            )
          })}
        </PairingSection>
      ) : null}

      {pairs.length > 0 ? (
        <PairingSection title="Couples" subtitle={`${pairs.length} pair${pairs.length === 1 ? '' : 's'}`}>
          {pairs.map(([a, b]) => (
            <PairResultRow
              key={a.id}
              left={toPairingPerson(a)}
              right={toPairingPerson(b)}
              onUnpair={() => onChange(unpair(relationships, a.id, b.id))}
            />
          ))}
        </PairingSection>
      ) : null}

      {singles.length > 0 ? (
        <PairingSection title="Single">
          {singles.map((p) => (
            <SingleResultRow
              key={p.id}
              person={toPairingPerson(p)}
              onChange={() => onChange(unassignSingle(relationships, p.id))}
            />
          ))}
        </PairingSection>
      ) : null}

      {unassigned.length === 0 && pairs.length === 0 && singles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          All set.
        </Typography>
      ) : null}
    </Stack>
  )
}
