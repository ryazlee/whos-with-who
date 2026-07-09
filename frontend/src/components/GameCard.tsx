import { Box, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import GameCardContent from './GameCardContent'
import PrimaryActionButton from './PrimaryActionButton'

type Props = {
  game: GameSummary
  featured?: boolean
  compact?: boolean
  dailyDate?: string
}

export default function GameCard({ game, featured, compact, dailyDate }: Props) {
  const completed = getCompletedAttemptForGame(game.id)
  const destination = `/game/${game.id}/play`

  const metaExtras = [
    completed ? `Score ${completed.score100}` : null,
  ]

  if (featured) {
    const dateLabel = dailyDate
      ? new Date(`${dailyDate}T12:00:00`).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : 'Today'

    return (
      <Box className="surfaceCard gameCard gameCard--featured">
        <Typography component="p" className="gameCard__eyebrow">
          Daily challenge · {dateLabel}
        </Typography>

        <GameCardContent
          game={game}
          metaExtras={metaExtras}
          titleVariant="h6"
          avatarSize={48}
          avatarMax={4}
        />

        <PrimaryActionButton
          to={destination}
          label={completed ? 'View score' : 'Play today'}
          sx={{ py: 1.15, mt: 0.25 }}
        />
      </Box>
    )
  }

  if (compact) {
    return (
      <Box
        component={RouterLink}
        to={destination}
        className="surfaceCard gameCard gameCard--interactive"
      >
        <GameCardContent
          game={game}
          metaExtras={metaExtras}
          tagLimit={3}
          avatarSize={40}
          avatarMax={3}
        />
      </Box>
    )
  }

  return null
}
