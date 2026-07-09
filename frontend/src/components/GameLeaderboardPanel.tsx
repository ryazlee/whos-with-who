import { Box, Typography } from '@mui/material'
import type { LeaderboardEntry } from '../datastore/types'
import SectionCard from './SectionCard'

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
        <Box className="leaderboardList">
          {leaderboard.map((row) => {
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
