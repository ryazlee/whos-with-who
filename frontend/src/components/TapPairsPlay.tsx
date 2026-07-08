import { useMemo, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import {
  clearPerson,
  isComplete,
  selectionsToTapPairAssigned,
  setPair,
  setSingle,
  tapPairsToSelections,
  type TapPairAssignment,
} from '../game/pairMatching'
import PersonAvatar from './PersonAvatar'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
}

export default function TapPairsPlay({ people, allowSingleChoice, selections, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragSourceId, setDragSourceId] = useState<string | null>(null)

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

  function handleDrop(targetId: string) {
    if (!dragSourceId || dragSourceId === targetId) return
    pushAssigned(setPair(assigned, dragSourceId, targetId))
    setDragSourceId(null)
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

  const complete = isComplete(
    people.map((p) => p.id),
    assigned,
    allowSingleChoice,
  )

  return (
    <Stack spacing={2}>
      {pairs.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            PAIRS
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 0.75 }}>
            {pairs.map(([a, b]) => (
              <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <PersonAvatar
                  person={a}
                  size={64}
                  paired
                  selected={selectedId === a.id}
                  draggable
                  onClick={() => handleTap(a.id)}
                  onDragStart={() => setDragSourceId(a.id)}
                  onDrop={() => handleDrop(a.id)}
                />
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                  ↔
                </Typography>
                <PersonAvatar
                  person={b}
                  size={64}
                  paired
                  selected={selectedId === b.id}
                  draggable
                  onClick={() => handleTap(b.id)}
                  onDragStart={() => setDragSourceId(b.id)}
                  onDrop={() => handleDrop(b.id)}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {singles.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            SINGLE
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75 }}>
            {singles.map((p) => (
              <PersonAvatar
                key={p.id}
                person={p}
                size={64}
                paired
                selected={selectedId === p.id}
                draggable
                onClick={() => handleTap(p.id)}
                onDragStart={() => setDragSourceId(p.id)}
                onDrop={() => handleDrop(p.id)}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      {unassigned.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            {selectedId ? 'TAP TO PAIR' : 'TAP OR DRAG'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75 }}>
            {unassigned.map((p) => (
              <PersonAvatar
                key={p.id}
                person={p}
                size={72}
                selected={selectedId === p.id}
                draggable
                onClick={() => handleTap(p.id)}
                onDragStart={() => setDragSourceId(p.id)}
                onDrop={() => handleDrop(p.id)}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      {selectedId && allowSingleChoice ? (
        <Button variant="outlined" size="small" onClick={handleMarkSingle} sx={{ alignSelf: 'flex-start', borderRadius: 2 }}>
          Mark {peopleById.get(selectedId)?.name} as Single
        </Button>
      ) : null}

      {selectedId ? (
        <Button
          variant="text"
          size="small"
          color="inherit"
          onClick={() => {
            const next = { ...assigned }
            clearPerson(next, selectedId)
            pushAssigned(next)
            setSelectedId(null)
          }}
          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          Clear selection
        </Button>
      ) : null}

      {!complete ? (
        <Typography variant="caption" color="text.secondary">
          Pair everyone{allowSingleChoice ? ' or mark singles' : ''} to submit.
        </Typography>
      ) : null}
    </Stack>
  )
}
