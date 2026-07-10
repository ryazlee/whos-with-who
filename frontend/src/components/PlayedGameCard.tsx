import { Box, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import type { GameAttemptRef } from '../lib/localAttempts'
import { formatPostedDate } from '../lib/formatters'
import { gameStatsPath } from '../lib/gameUrl'
import { formatScore } from '../lib/formatScore'
import GameCardContent from './GameCardContent'

type Props = {
  attempt: GameAttemptRef
  game: GameSummary | null
}

export default function PlayedGameCard({ attempt, game }: Props) {
  const playedOn = formatPostedDate(attempt.completedAt)

  return (
    <Box className="meGameRow">
      {game ? (
        <GameCardContent
          game={game}
          layout="inline"
          tagLimit={2}
          avatarSize={32}
          avatarMax={3}
          metaExtras={[`Score ${formatScore(attempt.score100)}`, playedOn ? `Played ${playedOn}` : null]}
        />
      ) : (
        <Box className="gameCardStack gameCardStack--inline">
          <Box className="gameCard__body">
            <Typography variant="body1" component="p" className="gameCard__title">
              {attempt.gameId}
            </Typography>
            <Typography variant="caption" className="gameCard__meta" component="p">
              Score {formatScore(attempt.score100)}
              {playedOn ? ` · Played ${playedOn}` : ''}
            </Typography>
          </Box>
        </Box>
      )}

      <Box className="meGameRow__footer">
        <Box className="meGameRow__actions" component="nav" aria-label="Played game actions">
          <RouterLink
            className="meGameRow__action meGameRow__action--primary"
            to={`/attempt/${attempt.attemptId}/result`}
          >
            Score
          </RouterLink>
          <span className="meGameRow__sep" aria-hidden>
            ·
          </span>
          <RouterLink className="meGameRow__action" to={`/game/${attempt.gameId}/play`}>
            Review picks
          </RouterLink>
          <span className="meGameRow__sep" aria-hidden>
            ·
          </span>
          <RouterLink className="meGameRow__action" to={gameStatsPath(game?.id ?? attempt.gameId)}>
            Stats
          </RouterLink>
        </Box>
      </Box>
    </Box>
  )
}
