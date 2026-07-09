import { Navigate, useParams } from 'react-router-dom'
import GameSummaryHero from '../components/GameSummaryHero'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PrimaryActionButton from '../components/PrimaryActionButton'
import StickyActionBar from '../components/StickyActionBar'
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
    <div className="page page--withActionBar">
      <GameSummaryHero game={game} />

      <StickyActionBar>
        <div className="stickyActionBarInner playSubmitDock">
          <PrimaryActionButton
            to={`/game/${game.id}/play`}
            label="Play"
          />
        </div>
      </StickyActionBar>
    </div>
  )
}
