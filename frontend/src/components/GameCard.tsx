import { Box, Chip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { formatAttemptCount, formatPostedDate, formatTag } from '../lib/formatters'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import FaceStack, { faceStackWidth } from './FaceStack'
import MatchingModeChip from './MatchingModeChip'
import PrimaryActionButton from './PrimaryActionButton'

type Props = {
  game: GameSummary
  featured?: boolean
  compact?: boolean
  dailyDate?: string
}

function MetaLine({ items }: { items: string[] }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: 'block' }}>
      {items.join(' · ')}
    </Typography>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.35,
        alignItems: 'center',
        mt: 0.15,
      }}
    >
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={formatTag(tag)}
          size="small"
          variant="outlined"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            borderColor: 'divider',
            bgcolor: 'transparent',
            '& .MuiChip-label': { px: 0.65 },
          }}
        />
      ))}
    </Box>
  )
}

function CompactCardBody({ game, metaItems }: { game: GameSummary; metaItems: string[] }) {
  const authorMeta = game.authorName?.trim()
    ? [`By ${game.authorName.trim()}`, ...metaItems]
    : metaItems

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 0.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {game.title}
        </Typography>
        <MatchingModeChip mode={game.ownerMatchingMode} />
      </Box>
      <MetaLine items={authorMeta} />
      <Box sx={{ mt: 'auto' }}>
        <TagRow tags={game.tags.slice(0, 2)} />
      </Box>
    </>
  )
}

export default function GameCard({ game, featured, compact, dailyDate }: Props) {
  const completed = getCompletedAttemptForGame(game.id)
  const destination = completed
    ? `/attempt/${completed.attemptId}/result`
    : `/game/${game.id}/play`

  const metaItems = [
    `${game.peopleCount} people`,
    `${formatAttemptCount(game.attemptCount)} plays`,
    formatPostedDate(game.publishedAt),
    completed ? `Score ${completed.score100}` : null,
  ].filter(Boolean) as string[]

  if (featured) {
    const dateLabel = dailyDate
      ? new Date(`${dailyDate}T12:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      : 'Today'

    const stackSize = 44
    const stackMax = 4

    const featuredMeta = game.authorName?.trim()
      ? [`By ${game.authorName.trim()}`, ...metaItems]
      : metaItems

    return (
      <Box className="surfaceCard featuredGameCard" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
          <Typography className="section-label" component="p">
            Daily challenge
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dateLabel}
          </Typography>
        </Box>

        <Box className="featuredGameCard__hero">
          <Box
            className="gameCardCompact__avatar"
            sx={{ width: faceStackWidth(stackSize, stackMax) }}
          >
            <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={stackSize} max={stackMax} />
          </Box>

          <Box className="featuredGameCard__content">
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
              <Typography variant="h6" component="h2" sx={{ lineHeight: 1.25, fontWeight: 600 }}>
                {game.title}
              </Typography>
              <MatchingModeChip mode={game.ownerMatchingMode} />
            </Box>
            {game.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {game.description}
              </Typography>
            ) : null}
            <MetaLine items={featuredMeta} />
            <TagRow tags={game.tags} />
          </Box>
        </Box>

        <PrimaryActionButton
          to={destination}
          label={completed ? 'View score' : 'Play today'}
          sx={{ py: 1.1 }}
        />
      </Box>
    )
  }

  if (compact) {
    const stackSize = 36
    const stackMax = 3

    return (
      <Box
        component={RouterLink}
        to={destination}
        className="surfaceCard gameCardCompact gameCardRow"
        sx={{
          p: 1.25,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '@media (hover: hover)': {
            '&:hover': {
              borderColor: 'text.secondary',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            },
          },
        }}
      >
        <Box
          className="gameCardCompact__avatar"
          sx={{ width: faceStackWidth(stackSize, stackMax) }}
        >
          <FaceStack
            people={game.previewPeople}
            totalCount={game.peopleCount}
            size={stackSize}
            max={stackMax}
          />
        </Box>
        <Box className="gameCardCompact__body">
          <CompactCardBody game={game} metaItems={metaItems} />
        </Box>
      </Box>
    )
  }

  return null
}
