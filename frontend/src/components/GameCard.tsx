import { Box, Button, Chip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { formatAttemptCount, formatTag } from '../lib/formatters'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import { tagChipColors } from '../lib/tagColors'
import FaceStack from './FaceStack'
import MatchingModeChip from './MatchingModeChip'

type Props = {
  game: GameSummary
  featured?: boolean
  compact?: boolean
  dailyDate?: string
}

const displayFont = '"Fredoka", "Nunito", sans-serif'

function MetaLine({ items }: { items: string[] }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
      {items.join(' · ')}
    </Typography>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {tags.map((tag) => {
        const colors = tagChipColors(tag)
        return (
          <Chip
            key={tag}
            label={formatTag(tag)}
            size="small"
            sx={{
              height: 22,
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 999,
              bgcolor: colors.bg,
              color: colors.text,
              border: 'none',
              '& .MuiChip-label': { px: 0.9 },
            }}
          />
        )
      })}
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
    `${formatAttemptCount(game.attemptCount)} guesses`,
    completed ? `you got ${completed.score100}` : null,
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
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          bgcolor: 'background.paper',
          p: 2.25,
          boxShadow: '0 8px 28px rgba(255, 92, 58, 0.18), 0 2px 8px rgba(45, 36, 32, 0.06)',
          border: '3px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />

        <Chip
          label="🎯 Today's game"
          size="small"
          sx={{
            mb: 1.25,
            fontWeight: 700,
            fontFamily: displayFont,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            border: 'none',
            fontSize: 12,
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
          {dateLabel}
        </Typography>

        <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={54} max={5} />

        <Typography
          variant="h5"
          sx={{ mt: 1.5, fontFamily: displayFont, fontWeight: 700, lineHeight: 1.1 }}
        >
          {game.title}
        </Typography>

        {game.description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.65,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontWeight: 500,
            }}
          >
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

        <Button
          component={RouterLink}
          to={destination}
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 2, py: 1.35, fontSize: '1.05rem' }}
        >
          {completed ? 'See your score ✨' : "Let's play!"}
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
          borderRadius: 3,
          bgcolor: 'background.paper',
          p: 1.35,
          boxShadow: '0 2px 10px rgba(45, 36, 32, 0.06)',
          border: '2px solid',
          borderColor: 'divider',
          transition: 'transform 140ms ease, box-shadow 140ms ease',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(255, 92, 58, 0.14)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.85 }}>
          <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={38} max={3} />
          <MatchingModeChip mode={game.ownerMatchingMode} />
        </Box>

        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: displayFont,
            fontWeight: 700,
            lineHeight: 1.15,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {game.title}
        </Typography>

        <Box sx={{ mt: 0.85 }}>
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
