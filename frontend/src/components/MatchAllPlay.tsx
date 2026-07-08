import { useMemo } from 'react'
import { Box, FormControl, MenuItem, Select, Stack } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import PersonAvatar from './PersonAvatar'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
}

export default function MatchAllPlay({ people, allowSingleChoice, selections, onChange }: Props) {
  const partnerOptionsByPersonId = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const p of people) {
      map.set(
        p.id,
        people.filter((other) => other.id !== p.id).map((other) => other.id),
      )
    }
    return map
  }, [people])

  return (
    <Stack spacing={1.5}>
      {people.map((p) => {
        const value = selections[p.id] ?? null
        const options = partnerOptionsByPersonId.get(p.id) ?? []
        const selectValue = value === null ? 'single' : value
        const partner = value ? people.find((x) => x.id === value) : null

        return (
          <Box
            key={p.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 0.5,
            }}
          >
            <PersonAvatar person={p} size={56} />
            <FormControl fullWidth size="small" variant="standard">
              <Select
                value={selectValue}
                disableUnderline
                onChange={(e) => {
                  const v = e.target.value
                  onChange({
                    ...selections,
                    [p.id]: v === 'single' ? null : v,
                  })
                }}
                renderValue={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {partner ? (
                      <Box
                        component="img"
                        src={partner.imageUrl}
                        alt=""
                        sx={{ width: 28, height: 28, borderRadius: 1.5, objectFit: 'cover' }}
                      />
                    ) : null}
                    <span>{partner?.name ?? 'Single'}</span>
                  </Box>
                )}
              >
                {allowSingleChoice ? <MenuItem value="single">Single</MenuItem> : null}
                {options.map((partnerId: string) => {
                  const opt = people.find((x) => x.id === partnerId)!
                  return (
                    <MenuItem key={partnerId} value={partnerId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={opt.imageUrl}
                          alt=""
                          sx={{ width: 28, height: 28, borderRadius: 1.5, objectFit: 'cover' }}
                        />
                        {opt.name}
                      </Box>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>
        )
      })}
    </Stack>
  )
}
