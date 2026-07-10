import { Stack } from '@mui/material'
import { useParams } from 'react-router-dom'
import GameSummaryHero from '../components/GameSummaryHero'
import Page from '../components/Page'
import PageQueryState from '../components/PageQueryState'
import PrimaryActionButton from '../components/PrimaryActionButton'
import StickyActionBar from '../components/StickyActionBar'
import { useCanViewGameStats, useGameSummary } from '../hooks/useGame'
import { gameStatsPath } from '../lib/gameUrl'
import { formatScore } from '../lib/formatScore'

export default function GameLobbyPage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? ''
  const { canView, completed } = useCanViewGameStats(gameId)
  const { game, loading, error } = useGameSummary(gameId)

  return (
    <PageQueryState loading={loading} error={error} missing={!game}>
      {game ? (
        <Page withActionBar>
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
                    label={`View score (${formatScore(completed.score100)})`}
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
                  <PrimaryActionButton to={`/game/${game.id}/play`} label="Play" />
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
        </Page>
      ) : null}
    </PageQueryState>
  )
}
