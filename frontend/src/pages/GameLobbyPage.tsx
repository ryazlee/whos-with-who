import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import MatchingModeChip from '../components/MatchingModeChip'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import { useGameSummary } from '../hooks/useGame'

export default function GameLobbyPage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? ''
  const completed = gameId ? getCompletedAttemptForGame(gameId) : null
  const { game, loading, error } = useGameSummary(gameId)

  if (completed) {
    return <Navigate to={`/attempt/${completed.attemptId}/result`} replace />
  }

  if (loading) return <div className="page"><PageLoading /></div>

  if (error || !game) {
    return (
      <div className="page">
        <PageError message={error ?? 'Not found'} />
      </div>
    )
  }

  return (
    <div className="page">
      <Typography variant="h5" color="text.primary">
        {game.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
        <MatchingModeChip mode={game.ownerMatchingMode} />
        {game.modeLocked ? (
          <Typography variant="caption" color="text.secondary">
            locked
          </Typography>
        ) : null}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {game.peopleCount} people · {game.attemptCount} plays
      </Typography>
      <Button
        component={RouterLink}
        to={`/game/${game.id}/play`}
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ borderRadius: 2, py: 1.5, mt: 2 }}
      >
        Play
      </Button>
    </div>
  )
}
