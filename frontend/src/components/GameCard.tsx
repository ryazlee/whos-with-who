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
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
      {items.join(' · ')}
    </Typography>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35 }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={formatTag(tag)}
          size="small"
          variant="outlined"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            borderColor: 'divider',
            bgcolor: 'background.paper',
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
    completed ? `you: ${completed.score100}` : null,
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
      <Box
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Typography className="section-label" component="p" sx={{ mb: 0.5 }}>
          Daily challenge
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {dateLabel}
        </Typography>

        <Box
          sx={{
            display: { xs: 'block', md: 'flex' },
            gap: 2,
            alignItems: { md: 'flex-start' },
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={48} max={5} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, mt: { xs: 1.5, md: 0 } }}>
            <Typography variant="h5" sx={{ lineHeight: 1.25 }}>
              {game.title}
            </Typography>

            {game.description ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                {game.description}
              </Typography>
            ) : null}

            <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <MetaLine items={metaItems} />
              <MatchingModeChip mode={game.ownerMatchingMode} />
            </Box>

            <Box sx={{ mt: 1 }}>
              <TagRow tags={game.tags} />
            </Box>
          </Box>
        </Box>

        <Button
          component={RouterLink}
          to={destination}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 1.75, maxWidth: { md: 240 } }}
        >
          {completed ? 'View score' : 'Play'}
        </Button>
      </Box>
    )
  }

  if (compact) {
    return (
      <Box
        component={RouterLink}
        to={destination}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1.25,
          transition: 'border-color 0.15s',
          '&:hover': { borderColor: 'text.secondary' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.85 }}>
          <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={34} max={3} />
          <MatchingModeChip mode={game.ownerMatchingMode} />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {game.title}
        </Typography>

        <Box sx={{ mt: 0.75 }}>
          <MetaLine items={metaItems} />
        </Box>

        {game.tags.length > 0 ? (
          <Box sx={{ mt: 0.65 }}>
            <TagRow tags={game.tags.slice(0, 2)} />
          </Box>
        ) : null}
      </Box>
    )
  }

  return null
}
