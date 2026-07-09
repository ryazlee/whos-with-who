import { useMemo, useState } from 'react'
import { Box, Button, Collapse, LinearProgress, Stack, Typography } from '@mui/material'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import type { CommunityPerPerson } from '../datastore/types'
import type { Person } from '../game/types'
import PersonAvatar from './PersonAvatar'
import SectionCard from './SectionCard'

type Props = {
  communityPerPerson: CommunityPerPerson
  people: Person[]
  /** When false, content is always visible (stats page). */
  collapsible?: boolean
  defaultOpen?: boolean
}

export default function GameCommunityPanel({
  communityPerPerson,
  people,
  collapsible = true,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen || !collapsible)

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const personNameById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people])

  const partnerLabel = (partnerId: string | null) =>
    partnerId === null ? 'Single' : (personNameById.get(partnerId) ?? '?')

  const hasData = communityPerPerson.length > 0

  const content = hasData ? (
    <Stack spacing={1.5} sx={{ px: collapsible ? 2 : 0, pb: collapsible ? 2 : 0, pt: collapsible ? 0.5 : 0 }}>
      {communityPerPerson.map((x) => {
        const person = personById.get(x.personId)
        return (
          <Box key={x.personId}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                {person ? <PersonAvatar person={person} size={28} showName={false} /> : null}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {personNameById.get(x.personId)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {partnerLabel(x.topPartnerId)} · {x.topPercent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={x.topPercent} />
          </Box>
        )
      })}
    </Stack>
  ) : (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
      No crowd data yet — check back after more people play.
    </Typography>
  )

  if (!collapsible) {
    return (
      <SectionCard title="What everyone guessed" subtitle="Community picks per person">
        <Box sx={{ px: 0 }}>{content}</Box>
      </SectionCard>
    )
  }

  return (
    <Box className="surfaceCard">
      {hasData ? (
        <>
          <Button
            fullWidth
            onClick={() => setOpen((v) => !v)}
            endIcon={
              <ExpandMoreOutlinedIcon
                sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            }
            sx={{
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              color: 'text.primary',
              fontWeight: 500,
              borderRadius: 0,
            }}
          >
            What everyone else guessed
          </Button>
          <Collapse in={open}>{content}</Collapse>
        </>
      ) : (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            What everyone else guessed
          </Typography>
          {content}
        </Box>
      )}
    </Box>
  )
}
