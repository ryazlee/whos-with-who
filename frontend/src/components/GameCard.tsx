import { Box, Button, Chip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { formatAttemptCount, formatTag } from '../lib/formatters'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import FaceStack from './FaceStack'
import MatchingModeChip from './MatchingModeChip'

type Props = {
  game: GameSummary
  featured?: boolean
  compact?: boolean
  dailyDate?: string
}

function MetaLine({ items }: { items: string[] }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: 'block' }}>
      {items.join(' · ')}
    </Typography>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mt: 0.5 }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={formatTag(tag)}
          size="small"
          variant="outlined"
          sx={{
            height: 24,
            fontSize: '0.72rem',
            borderColor: 'divider',
            bgcolor: 'transparent',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      ))}
    </Box>
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

    return (
      <Box className="surfaceCard featuredGameCard" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography className="section-label" component="p" sx={{ mb: 0.35 }}>
          Daily challenge
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: { xs: 1.5, md: 2 } }}>
          {dateLabel}
        </Typography>

        <Box
          sx={{
            display: { xs: 'block', md: 'flex' },
            alignItems: { md: 'center' },
            gap: { md: 3 },
          }}
        >
          <Box sx={{ flexShrink: 0, mb: { xs: 1.5, md: 0 } }}>
            <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={56} max={5} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ lineHeight: 1.25, fontWeight: 600, fontSize: { xs: '1.15rem', md: '1.35rem' } }}
            >
              {game.title}
            </Typography>

            {game.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, lineHeight: 1.55, maxWidth: 560 }}
              >
                {game.description}
              </Typography>
            ) : null}

            <Box
              sx={{
                mt: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <MetaLine items={metaItems} />
              <MatchingModeChip mode={game.ownerMatchingMode} />
            </Box>

            <TagRow tags={game.tags} />
          </Box>

          <Button
            component={RouterLink}
            to={destination}
            variant="contained"
            color="primary"
            size="large"
            sx={{
              mt: { xs: 1.75, md: 0 },
              py: 1.25,
              px: 3,
              minWidth: { md: 168 },
              flexShrink: 0,
              alignSelf: { md: 'center' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {completed ? 'View score' : 'Play today'}
          </Button>
        </Box>
      </Box>
    )
  }

  if (compact) {
    return (
      <Box
        component={RouterLink}
        to={destination}
        className="surfaceCard gameCardCompact"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'stretch' },
          gap: { xs: 1.25, md: 1.5 },
          p: { xs: 1.25, md: 1.5 },
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '@media (hover: hover)': {
            '&:hover': {
              borderColor: 'text.secondary',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            },
          },
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <FaceStack
            people={game.previewPeople}
            totalCount={game.peopleCount}
            size={40}
            max={3}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 0.75,
              mb: 0.25,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: { md: '0.95rem' },
              }}
            >
              {game.title}
            </Typography>
            <MatchingModeChip mode={game.ownerMatchingMode} />
          </Box>
          <MetaLine items={metaItems} />
          {game.tags.length > 0 ? <TagRow tags={game.tags.slice(0, 2)} /> : null}
        </Box>
      </Box>
    )
  }

  return null
}
