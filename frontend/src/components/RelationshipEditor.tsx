import { Box, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'

export type DraftPerson = {
  id: string
  name: string
  photoDataUrl: string | null
}

/** personId → partnerId, or null = single */
export type DraftRelationships = Record<string, string | null>

export function syncRelationshipsForPeople(
  people: DraftPerson[],
  prev: DraftRelationships,
): DraftRelationships {
  const next: DraftRelationships = {}
  const ids = new Set(people.map((p) => p.id))
  for (const p of people) {
    const cur = prev[p.id]
    if (cur && ids.has(cur)) next[p.id] = cur
    else next[p.id] = null
  }
  // fix broken mutual pairs
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
    next[oldPartner] = null
  }

  next[personId] = partnerId

  if (partnerId) {
    const partnersOld = next[partnerId]
    if (partnersOld && partnersOld !== personId && next[partnersOld] === partnerId) {
      next[partnersOld] = null
    }
    next[partnerId] = personId
  }

  return next
}

export function relationshipsComplete(people: DraftPerson[], relationships: DraftRelationships): boolean {
  if (people.length < 2) return false
  for (const p of people) {
    if (!(p.id in relationships)) return false
    const partner = relationships[p.id]
    if (partner === undefined) return false
    if (partner !== null && partner !== p.id && relationships[partner] !== p.id) return false
  }
  return true
}

export function hasSingles(relationships: DraftRelationships): boolean {
  return Object.values(relationships).some((v) => v === null)
}

type Props = {
  people: DraftPerson[]
  relationships: DraftRelationships
  onChange: (relationships: DraftRelationships) => void
}

export default function RelationshipEditor({ people, relationships, onChange }: Props) {
  const named = people.filter((p) => p.name.trim())

  if (named.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Add at least two people with names to set couples.
      </Typography>
    )
  }

  return (
    <Stack spacing={1.25}>
      {named.map((person) => {
        const value = relationships[person.id]
        const selectValue = value === null || value === undefined ? 'single' : value
        const options = named.filter((p) => p.id !== person.id)

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
                value={selectValue}
                disableUnderline
                onChange={(e) => {
                  const v = e.target.value
                  onChange(setPartner(relationships, person.id, v === 'single' ? null : v))
                }}
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
  )
}
