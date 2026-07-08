import { Box, Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'

export type DraftPerson = {
  id: string
  name: string
  photoDataUrl: string | null
}

/** undefined = not set yet, null = single, string = partner id */
export type DraftRelationships = Record<string, string | null | undefined>

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

  if (named.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Add at least two people with names to set couples.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {pairs.length > 0 ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Pairs
          </Typography>
          <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
            {pairs.map(([a, b]) => (
              <Box
                key={a.id}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.85, gap: 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {a.name} ↔ {b.name}
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => onChange(unpair(relationships, a.id, b.id))}
                  sx={{ flexShrink: 0, fontSize: '0.8rem' }}
                >
                  Unpair
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {singles.length > 0 ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Single
          </Typography>
          <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
            {singles.map((p) => (
              <Box
                key={p.id}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.85, gap: 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {p.name}
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => onChange(unassignSingle(relationships, p.id))}
                  sx={{ flexShrink: 0, fontSize: '0.8rem' }}
                >
                  Change
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {unassigned.length > 0 ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            {unassigned.length === 1 ? 'Last person' : 'Set couples'}
          </Typography>
          <Stack spacing={1.25}>
            {unassigned.map((person) => {
              const options = unassigned.filter((p) => p.id !== person.id)

              return (
                <Box
                  key={person.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 72, flexShrink: 0 }}>
                    {person.name}
                  </Typography>
                  <FormControl fullWidth size="small" variant="standard">
                    <Select
                      value=""
                      displayEmpty
                      disableUnderline
                      onChange={(e) => {
                        const v = e.target.value
                        if (!v) return
                        onChange(setPartner(relationships, person.id, v === 'single' ? null : v))
                      }}
                      renderValue={() => (
                        <Typography variant="body2" color="text.secondary">
                          Pick partner…
                        </Typography>
                      )}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      {options.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )
            })}
          </Stack>
        </Box>
      ) : null}

      {unassigned.length === 0 && pairs.length === 0 && singles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          All set.
        </Typography>
      ) : null}
    </Stack>
  )
}
