import { useMemo } from 'react'
import { Box, Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import {
  availablePartnerIds,
  clearMatchAllPair,
  setMatchAllPartner,
} from '../game/pairMatching'
import PersonAvatar from './PersonAvatar'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
}

export default function MatchAllPlay({ people, allowSingleChoice, selections, onChange }: Props) {
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

  return (
    <Stack spacing={2}>
      {pairs.length > 0 ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Pairs
          </Typography>
          <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
            {pairs.map(([a, b]) => (
              <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.85 }}>
                <PersonAvatar person={a} size={40} showName={false} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {a.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ↔
                </Typography>
                <PersonAvatar person={b} size={40} showName={false} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {b.name}
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => onChange(clearMatchAllPair(selections, a.id))}
                  sx={{ ml: 'auto', fontSize: '0.8rem' }}
                >
                  Unpair
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {allowSingleChoice && singles.length > 0 ? (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAvatar person={p} size={40} showName={false} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {p.name}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    const next = { ...selections }
                    delete next[p.id]
                    onChange(next)
                  }}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Change
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}

      {editablePeople.length > 0 ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Pick partners
          </Typography>
          <Stack spacing={1.5}>
            {editablePeople.map((p) => {
              const options = availablePartnerIds(p.id, peopleIds, selections)
              const value = selections[p.id]
              const hasSelection = p.id in selections
              const selectValue = !hasSelection ? '' : value === null ? 'single' : value
              const partner = value ? peopleById.get(value) : null

              return (
                <Box
                  key={p.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}
                >
                  <PersonAvatar person={p} size={56} />
                  <FormControl fullWidth size="small" variant="standard">
                    <Select
                      value={selectValue}
                      disableUnderline
                      displayEmpty
                      onChange={(e) => {
                        const v = e.target.value
                        if (!v) return
                        onChange(
                          setMatchAllPartner(
                            selections,
                            p.id,
                            v === 'single' ? null : v,
                          ),
                        )
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
                          <span>
                            {partner?.name ??
                              (hasSelection && value === null
                                ? 'Single'
                                : allowSingleChoice
                                  ? 'Pick partner…'
                                  : 'Pick…')}
                          </span>
                        </Box>
                      )}
                    >
                      {allowSingleChoice ? <MenuItem value="single">Single</MenuItem> : null}
                      {options.map((partnerId) => {
                        const opt = peopleById.get(partnerId)!
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
        </Box>
      ) : null}
    </Stack>
  )
}
