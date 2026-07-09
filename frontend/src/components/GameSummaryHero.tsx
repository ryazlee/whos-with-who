import { Box, Chip, Typography } from '@mui/material'
import type { GameSummary } from '../datastore/types'
import { formatAttemptCount, formatPostedDate, formatTag } from '../lib/formatters'
import FaceStack, { faceStackWidth } from './FaceStack'
import MatchingModeChip from './MatchingModeChip'

type Props = {
  game: GameSummary
  avatarSize?: number
  avatarMax?: number
}

export default function GameSummaryHero({
  game,
  avatarSize = 44,
  avatarMax = 4,
}: Props) {
  const stackWidth = faceStackWidth(avatarSize, avatarMax)

  const metaItems = [
    game.authorName?.trim() ? `By ${game.authorName.trim()}` : null,
    `${game.peopleCount} people`,
    `${formatAttemptCount(game.attemptCount)} plays`,
    formatPostedDate(game.publishedAt),
    game.modeLocked ? 'locked style' : null,
  ].filter(Boolean) as string[]

  return (
    <Box className="surfaceCard gameSummaryHero" sx={{ p: 1.5 }}>
      <Box className="gameCardRow">
        <Box className="gameCardCompact__avatar" sx={{ width: stackWidth }}>
          <FaceStack
            people={game.previewPeople}
            totalCount={game.peopleCount}
            size={avatarSize}
            max={avatarMax}
          />
        </Box>

        <Box className="gameCardCompact__body">
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
              {game.title}
            </Typography>
            <MatchingModeChip mode={game.ownerMatchingMode} />
          </Box>

          {game.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {game.description}
            </Typography>
          ) : null}

          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            {metaItems.join(' · ')}
          </Typography>

          {game.tags.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35, mt: 0.15 }}>
              {game.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={formatTag(tag)}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.68rem', '& .MuiChip-label': { px: 0.65 } }}
                />
              ))}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}
