import { Box } from '@mui/material'
import type { GameSummary } from '../datastore/types'
import GameCardContent from './GameCardContent'

type Props = {
  game: GameSummary
  avatarSize?: number
  avatarMax?: number
}

export default function GameSummaryHero({
  game,
  avatarSize = 48,
  avatarMax = 4,
}: Props) {
  const metaExtras = [game.modeLocked ? 'Style locked' : null]

  return (
    <Box className="surfaceCard gameCard gameCard--hero">
      <GameCardContent
        game={game}
        metaExtras={metaExtras}
        titleVariant="h6"
        avatarSize={avatarSize}
        avatarMax={avatarMax}
      />
    </Box>
  )
}
