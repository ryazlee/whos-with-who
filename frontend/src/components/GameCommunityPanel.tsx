import { useMemo, useState } from 'react'
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import type { CommunityPerPerson, ID } from '../datastore/types'
import type { Person } from '../game/types'
import {
  isCommunityPickCorrect,
  sortedCommunityPicks,
  topCommunityPicks,
} from '../lib/communityPicks'
import PersonAvatar from './PersonAvatar'
import SectionCard from './SectionCard'

type Props = {
  communityPerPerson: CommunityPerPerson
  people: Person[]
  /** Map person id → correct partner (null = single). Enables green/red highlights. */
  correctPartnerIdByPerson?: Map<ID, ID | null>
  /** When false, uses SectionCard layout and shows all picks sorted by frequency. */
  collapsible?: boolean
}

function pickLabel(
  personId: ID,
  partnerId: ID | null,
  personNameById: Map<string, string>,
) {
  const name = personNameById.get(personId) ?? '?'
  if (partnerId === null) return `${name} · Single`
  return `${name} · ${personNameById.get(partnerId) ?? '?'}`
}

function PickRow({
  personId,
  partnerId,
  percent,
  personById,
  personNameById,
  correctPartnerIdByPerson,
}: {
  personId: ID
  partnerId: ID | null
  percent: number
  personById: Map<string, Person>
  personNameById: Map<string, string>
  correctPartnerIdByPerson?: Map<ID, ID | null>
}) {
  const person = personById.get(personId)
  const partner = partnerId ? personById.get(partnerId) : null
  const correctness = isCommunityPickCorrect(personId, partnerId, correctPartnerIdByPerson)
  const highlight = correctness === true ? 'correct' : correctness === false ? 'wrong' : undefined
  const rowClass =
    correctness === true
      ? 'crowdPickRow crowdPickRow--correct'
      : correctness === false
        ? 'crowdPickRow crowdPickRow--wrong'
        : 'crowdPickRow'

  return (
    <Box className={rowClass}>
      <Box className="crowdPickRow__header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {person ? (
              <PersonAvatar person={person} size={32} showName={false} highlight={highlight} />
            ) : null}
            {partner ? (
              <PersonAvatar person={partner} size={32} showName={false} highlight={highlight} />
            ) : null}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 0 }}>
            {pickLabel(personId, partnerId, personNameById)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {percent}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={percent} className="crowdPickRow__bar" />
    </Box>
  )
}

export default function GameCommunityPanel({
  communityPerPerson,
  people,
  correctPartnerIdByPerson,
  collapsible = true,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const personNameById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people])

  const allPicks = useMemo(() => sortedCommunityPicks(communityPerPerson), [communityPerPerson])
  const previewPicks = useMemo(() => topCommunityPicks(communityPerPerson, 5), [communityPerPerson])
  const visiblePicks = collapsible ? (expanded ? allPicks : previewPicks) : allPicks
  const hasData = allPicks.length > 0
  const canExpand = collapsible && allPicks.length > previewPicks.length

  const pickList = (
    <Stack spacing={1.25} className="crowdPickList">
      {visiblePicks.map((pick) => (
        <PickRow
          key={`${pick.personId}:${pick.partnerId ?? 'single'}`}
          personId={pick.personId}
          partnerId={pick.partnerId}
          percent={pick.percent}
          personById={personById}
          personNameById={personNameById}
          correctPartnerIdByPerson={correctPartnerIdByPerson}
        />
      ))}
    </Stack>
  )

  const expandControl = hasData && canExpand ? (
    <Button
      fullWidth
      onClick={() => setExpanded((v) => !v)}
      endIcon={
        <ExpandMoreOutlinedIcon
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      }
      sx={{
        justifyContent: 'space-between',
        mt: 1,
        px: collapsible ? 2 : 0,
        py: 1,
        color: 'text.secondary',
        fontWeight: 500,
        borderRadius: 0,
      }}
    >
      {expanded ? 'Show top picks only' : `Show all ${allPicks.length} picks`}
    </Button>
  ) : null

  const empty = (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
      No crowd data yet — check back after more people play.
    </Typography>
  )

  if (!collapsible) {
    return (
      <SectionCard title="Most popular picks">
        {hasData ? pickList : empty}
      </SectionCard>
    )
  }

  return (
    <Box className="surfaceCard">
      <Box sx={{ px: 2, pt: 1.5, pb: hasData ? 0.5 : 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Most popular picks
        </Typography>
      </Box>
      {hasData ? (
        <Box sx={{ px: 2, pb: 2 }}>
          {pickList}
          {expandControl}
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 1.5 }}>{empty}</Box>
      )}
    </Box>
  )
}
