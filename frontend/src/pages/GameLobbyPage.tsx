import { Stack } from '@mui/material'
import { useParams } from 'react-router-dom'
import GameSummaryHero from '../components/GameSummaryHero'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PrimaryActionButton from '../components/PrimaryActionButton'
import StickyActionBar from '../components/StickyActionBar'
import { useCanViewGameStats, useGameSummary } from '../hooks/useGame'
import { gameStatsPath } from '../lib/gameUrl'

export default function GameLobbyPage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? ''
  const { canView, completed } = useCanViewGameStats(gameId)
  const { game, loading, error } = useGameSummary(gameId)

  if (loading) return <div className="page"><PageLoading /></div>

  if (error || !game) {
    return (
      <div className="page">
        <PageError message={error ?? 'Not found'} />
      </div>
    )
  }

  return (
    <div className="page page--withActionBar">
      <GameSummaryHero game={game} />

      <StickyActionBar>
        <div className="stickyActionBarInner playSubmitDock">
          {completed ? (
            <Stack spacing={1} sx={{ width: '100%' }}>
              <PrimaryActionButton
                to={`/game/${game.id}/play`}
                label="Review your picks"
              />
              <PrimaryActionButton
                to={`/attempt/${completed.attemptId}/result`}
                label={`View score (${completed.score100})`}
                variant="outlined"
              />
              {canView ? (
                <PrimaryActionButton
                  to={gameStatsPath(game.id)}
                  label="Game stats"
                  variant="outlined"
                />
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ width: '100%' }}>
              <PrimaryActionButton
                to={`/game/${game.id}/play`}
                label="Play"
              />
              {canView ? (
                <PrimaryActionButton
                  to={gameStatsPath(game.id)}
                  label="Game stats"
                  variant="outlined"
                />
              ) : null}
            </Stack>
          )}
        </div>
      </StickyActionBar>
    </div>
  )
}
