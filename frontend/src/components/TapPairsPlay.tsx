import { useMemo, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import {
  clearPerson,
  selectionsToTapPairAssigned,
  setPair,
  setSingle,
  tapPairsToSelections,
  type TapPairAssignment,
} from '../game/pairMatching'
import { PairingProgress } from './PairingUI'
import PersonAvatar from './PersonAvatar'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
}

export default function TapPairsPlay({ people, allowSingleChoice, selections, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assigned = useMemo(
    () => selectionsToTapPairAssigned(people.map((p) => p.id), selections),
    [people, selections],
  )

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  function pushAssigned(next: Record<string, TapPairAssignment>) {
    onChange(tapPairsToSelections(people.map((p) => p.id), next))
  }

  function handleTap(personId: string) {
    if (selectedId === null) {
      setSelectedId(personId)
      return
    }

    if (selectedId === personId) {
      setSelectedId(null)
      return
    }

    pushAssigned(setPair(assigned, selectedId, personId))
    setSelectedId(null)
  }

  function handleMarkSingle() {
    if (!selectedId || !allowSingleChoice) return
    pushAssigned(setSingle(assigned, selectedId))
    setSelectedId(null)
  }

  const pairs: Array<[Person, Person]> = []
  const singles: Person[] = []
  const unassigned: Person[] = []
  const seen = new Set<string>()

  for (const p of people) {
    if (seen.has(p.id)) continue
    const v = assigned[p.id]
    if (v === null || v === undefined) {
      unassigned.push(p)
      seen.add(p.id)
    } else if (v === 'single') {
      singles.push(p)
      seen.add(p.id)
    } else {
      const partner = peopleById.get(v)
      if (partner) {
        pairs.push([p, partner])
        seen.add(p.id)
        seen.add(partner.id)
      }
    }
  }

  const assignedCount = pairs.length * 2 + singles.length

  return (
    <Stack spacing={2}>
      <PairingProgress
        total={people.length}
        assigned={assignedCount}
        hint={selectedId ? `Pair with ${peopleById.get(selectedId)?.name}` : 'Tap one person, then their partner'}
      />

      {pairs.length > 0 ? (
        <Box className="surfaceCard" sx={{ p: 1.5 }}>
          <Typography className="section-label" component="p" sx={{ mb: 1 }}>
            Pairs
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            {pairs.map(([a, b]) => (
              <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAvatar
                  person={a}
                  size={72}
                  paired
                  selected={selectedId === a.id}
                  onClick={() => handleTap(a.id)}
                />
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                  ↔
                </Typography>
                <PersonAvatar
                  person={b}
                  size={72}
                  paired
                  selected={selectedId === b.id}
                  onClick={() => handleTap(b.id)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {singles.length > 0 ? (
        <Box className="surfaceCard" sx={{ p: 1.5 }}>
          <Typography className="section-label" component="p" sx={{ mb: 1 }}>
            Single
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(96px, 1fr))',
                md: 'repeat(auto-fill, minmax(108px, 120px))',
              },
              gap: 1.5,
              maxWidth: { md: 480 },
              mx: { md: 'auto' },
              justifyContent: { md: 'center' },
            }}
          >
            {singles.map((p) => (
              <PersonAvatar
                key={p.id}
                person={p}
                size={76}
                paired
                selected={selectedId === p.id}
                onClick={() => handleTap(p.id)}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      {unassigned.length > 0 ? (
        <Box className="surfaceCard" sx={{ p: 1.5 }}>
          <Typography className="section-label" component="p" sx={{ mb: 1 }}>
            {selectedId ? `Tap ${peopleById.get(selectedId)?.name}'s partner` : 'Tap to pair'}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(96px, 1fr))',
                md: 'repeat(auto-fill, minmax(108px, 120px))',
              },
              gap: 1.5,
              maxWidth: { md: 560 },
              mx: { md: 'auto' },
              justifyContent: { md: 'center' },
            }}
          >
            {unassigned.map((p) => (
              <PersonAvatar
                key={p.id}
                person={p}
                size={80}
                selected={selectedId === p.id}
                onClick={() => handleTap(p.id)}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      {selectedId && allowSingleChoice ? (
        <Button
          variant="outlined"
          onClick={handleMarkSingle}
          fullWidth
          sx={{ py: 1.1, borderStyle: 'dashed' }}
        >
          Mark {peopleById.get(selectedId)?.name} as single
        </Button>
      ) : null}

      {selectedId ? (
        <Button
          variant="text"
          color="inherit"
          onClick={() => {
            const next = { ...assigned }
            clearPerson(next, selectedId)
            pushAssigned(next)
            setSelectedId(null)
          }}
          fullWidth
          sx={{ color: 'text.secondary' }}
        >
          Cancel selection
        </Button>
      ) : null}
    </Stack>
  )
}
