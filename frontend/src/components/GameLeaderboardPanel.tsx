import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { LeaderboardEntry } from '../datastore/types'
import { TOP_LIST_EXPANDED_COUNT, TOP_LIST_PREVIEW_COUNT } from '../lib/topListLimits'
import SectionCard from './SectionCard'
import TopListExpandButton from './TopListExpandButton'

type Props = {
  leaderboard: LeaderboardEntry[]
  loading?: boolean
  highlightAttemptId?: string
  highlightName?: string
  highlightScore?: number
}

export default function GameLeaderboardPanel({
  leaderboard,
  loading = false,
  highlightAttemptId,
  highlightName,
  highlightScore,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const visibleLimit = expanded ? TOP_LIST_EXPANDED_COUNT : TOP_LIST_PREVIEW_COUNT
  const visibleRows = useMemo(
    () => leaderboard.slice(0, visibleLimit),
    [leaderboard, visibleLimit],
  )
  const canExpand = leaderboard.length > TOP_LIST_PREVIEW_COUNT

  const youOnLeaderboard = highlightAttemptId
    ? leaderboard.some((row) => row.attemptId === highlightAttemptId)
    : false

  return (
    <SectionCard title="Top scores" noPadding>
      {loading ? (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Loading scores…
          </Typography>
        </Box>
      ) : leaderboard.length > 0 ? (
        <>
          <Box className="leaderboardList">
            {visibleRows.map((row) => {
              const isYou = highlightAttemptId != null && row.attemptId === highlightAttemptId
              return (
                <Box
                  key={row.attemptId}
                  className={isYou ? 'leaderboardRow leaderboardRow--you' : 'leaderboardRow'}
                >
                  <span
                    className={
                      row.rank <= 3
                        ? `leaderboardRow__rank leaderboardRow__rank--${row.rank}`
                        : 'leaderboardRow__rank'
                    }
                  >
                    {row.rank}
                  </span>
                  <Typography component="p" className="leaderboardRow__name">
                    {row.displayName}
                    {isYou ? ' (you)' : ''}
                  </Typography>
                  <Typography component="p" className="leaderboardRow__score">
                    {row.score100}
                  </Typography>
                </Box>
              )
            })}
            {highlightAttemptId && highlightName != null && highlightScore != null && !youOnLeaderboard ? (
              <Box className="leaderboardRow leaderboardRow--you">
                <span className="leaderboardRow__rank">—</span>
                <Typography component="p" className="leaderboardRow__name">
                  {highlightName} (you)
                </Typography>
                <Typography component="p" className="leaderboardRow__score">
                  {highlightScore}
                </Typography>
              </Box>
            ) : null}
          </Box>
          {canExpand ? (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <TopListExpandButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
            </Box>
          ) : null}
        </>
      ) : (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            No scores yet — be the first to play.
          </Typography>
        </Box>
      )}
    </SectionCard>
  )
}
