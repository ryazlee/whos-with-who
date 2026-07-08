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
  /** Tighter vertical card for 2-column grids. */
  compact?: boolean
  dailyDate?: string
}

function MetaDots({ items }: { items: string[] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.6,
        color: 'text.secondary',
        typography: 'caption',
        fontWeight: 500,
      }}
    >
      {items.map((item, i) => (
        <Box key={item} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
          {i > 0 ? (
            <Box component="span" sx={{ opacity: 0.45, fontSize: 11 }}>
              ·
            </Box>
          ) : null}
          {item}
        </Box>
      ))}
    </Box>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
      {tags.slice(0, 4).map((tag) => (
        <Chip
          key={tag}
          label={formatTag(tag)}
          size="small"
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 999,
            bgcolor: 'action.hover',
            border: 'none',
            color: 'text.secondary',
            '& .MuiChip-label': { px: 1 },
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
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2.25,
          backgroundImage: (theme) =>
            `linear-gradient(160deg, ${theme.palette.primary.main}14 0%, transparent 55%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.75 }}>
          <Box>
            <Typography
              variant="caption"
              color="primary"
              sx={{ fontWeight: 700, letterSpacing: '0.02em', display: 'block' }}
            >
              Today’s challenge
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dateLabel}
            </Typography>
          </Box>
          <MatchingModeChip mode={game.ownerMatchingMode} />
        </Box>

        <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={52} max={5} />

        <Typography
          variant="h5"
          sx={{
            mt: 1.75,
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}
        >
          {game.title}
        </Typography>

        {game.description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.45,
            }}
          >
            {game.description}
          </Typography>
        ) : null}

        <Box sx={{ mt: 1.35 }}>
          <MetaDots items={metaItems} />
        </Box>

        <Box sx={{ mt: 1.1 }}>
          <TagRow tags={game.tags} />
        </Box>

        <Button
          component={RouterLink}
          to={destination}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, borderRadius: 999, py: 1.2 }}
        >
          {completed ? 'See your score' : 'Play'}
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
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1.35,
          transition: 'transform 140ms ease, border-color 140ms ease',
          '&:hover': {
            borderColor: 'primary.light',
          },
          '&:active': {
            transform: 'scale(0.99)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
          <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={36} max={3} />
          <MatchingModeChip mode={game.ownerMatchingMode} />
        </Box>

        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {game.title}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <MetaDots items={metaItems} />
        </Box>

        {game.tags.length > 0 ? (
          <Box sx={{ mt: 0.75 }}>
            <TagRow tags={game.tags.slice(0, 2)} />
          </Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      component={RouterLink}
      to={destination}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 1.75,
        transition: 'transform 140ms ease, border-color 140ms ease',
        '&:hover': {
          borderColor: 'primary.light',
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <FaceStack people={game.previewPeople} totalCount={game.peopleCount} size={44} max={3} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {game.title}
            </Typography>
            <MatchingModeChip mode={game.ownerMatchingMode} />
          </Box>

          {game.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.8125rem',
                lineHeight: 1.4,
              }}
            >
              {game.description}
            </Typography>
          ) : null}

          <Box sx={{ mt: 0.9 }}>
            <MetaDots items={metaItems} />
          </Box>

          <Box sx={{ mt: 0.9 }}>
            <TagRow tags={game.tags} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
