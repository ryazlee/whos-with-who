import { useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import {
  availablePartnerIds,
  clearMatchAllPair,
  countMatchAllProgress,
  setMatchAllPartner,
} from '../game/pairMatching'
import {
  PairingProgress,
  PairingSection,
  PairResultRow,
  PartnerPickerRow,
  RemainingPeopleRow,
  SingleResultRow,
  type PairingPerson,
} from './PairingUI'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  singlesInGame: number
  pairsInGame: number
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
}

function toPairingPerson(p: Person): PairingPerson {
  return { id: p.id, name: p.name, imageUrl: p.imageUrl }
}

export default function MatchAllPlay({
  people,
  allowSingleChoice,
  singlesInGame,
  pairsInGame,
  selections,
  onChange,
}: Props) {
  const peopleIds = useMemo(() => people.map((p) => p.id), [people])
  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  const editablePeople = useMemo(
    () =>
      people.filter((p) => {
        if (!(p.id in selections)) return true
        const partner = selections[p.id]
        if (partner && selections[partner] === p.id) return false
        if (partner === null) return false
        return true
      }),
    [people, selections],
  )

  const pairs = useMemo(() => {
    const out: Array<[Person, Person]> = []
    const seen = new Set<string>()
    for (const p of people) {
      if (seen.has(p.id)) continue
      const partnerId = selections[p.id]
      if (partnerId && selections[partnerId] === p.id) {
        const partner = peopleById.get(partnerId)
        if (partner) {
          out.push([p, partner])
          seen.add(p.id)
          seen.add(partnerId)
        }
      }
    }
    return out
  }, [people, selections, peopleById])

  const singles = useMemo(
    () => people.filter((p) => selections[p.id] === null && p.id in selections),
    [people, selections],
  )

  const { assigned } = countMatchAllProgress(peopleIds, selections)
  const remainingPeople = editablePeople.map(toPairingPerson)

  return (
    <Stack spacing={2}>
      <PairingProgress
        total={people.length}
        assigned={assigned}
        singlesInGame={singlesInGame}
        pairsInGame={pairsInGame}
        hint={allowSingleChoice ? 'Match everyone or mark singles' : 'Match everyone into pairs'}
      />

      {editablePeople.length > 0 ? (
        <PairingSection
          title={editablePeople.length === 1 ? 'Last person' : 'Match people'}
          subtitle="Pick a partner — they'll both leave this list"
        >
          {editablePeople.length > 1 ? (
            <Box sx={{ px: 1.5, py: 1.1 }}>
              <RemainingPeopleRow people={remainingPeople} />
            </Box>
          ) : null}
          {editablePeople.map((p) => {
            const optionIds = availablePartnerIds(p.id, peopleIds, selections)
            const options = optionIds.map((id) => toPairingPerson(peopleById.get(id)!))
            const value = selections[p.id]
            const hasSelection = p.id in selections
            const selectValue: '' | 'single' | string = !hasSelection
              ? ''
              : value === null
                ? 'single'
                : value ?? ''

            return (
              <PartnerPickerRow
                key={p.id}
                person={toPairingPerson(p)}
                options={options}
                allowSingle={allowSingleChoice}
                value={selectValue}
                onSelect={(partnerId) => onChange(setMatchAllPartner(selections, p.id, partnerId))}
              />
            )
          })}
        </PairingSection>
      ) : null}

      {pairs.length > 0 ? (
        <PairingSection title="Your pairs" subtitle={`${pairs.length} locked in`}>
          {pairs.map(([a, b]) => (
            <PairResultRow
              key={a.id}
              left={toPairingPerson(a)}
              right={toPairingPerson(b)}
              onUnpair={() => onChange(clearMatchAllPair(selections, a.id))}
            />
          ))}
        </PairingSection>
      ) : null}

      {allowSingleChoice && singles.length > 0 ? (
        <PairingSection title="Single">
          {singles.map((p) => (
            <SingleResultRow
              key={p.id}
              person={toPairingPerson(p)}
              onChange={() => {
                const next = { ...selections }
                delete next[p.id]
                onChange(next)
              }}
            />
          ))}
        </PairingSection>
      ) : null}
    </Stack>
  )
}
