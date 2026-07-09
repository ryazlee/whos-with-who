import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import GameCommunityPanel from '../components/GameCommunityPanel'
import GameLeaderboardPanel from '../components/GameLeaderboardPanel'
import GameSummaryHero from '../components/GameSummaryHero'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import {
  useCanViewGameStats,
  useGameCommunityStats,
  useGameForPlay,
  useGameLeaderboard,
  useGameSummary,
} from '../hooks/useGame'
import { formatAttemptCount } from '../lib/formatters'
import { getLocalAttemptResult } from '../lib/localAttempts'
import { gamePlayPath } from '../lib/gameUrl'

export default function GameStatsPage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? ''

  const { canView, completed, isOwner, loading: accessLoading } = useCanViewGameStats(gameId)
  const { game, loading: summaryLoading, error: summaryError } = useGameSummary(gameId)

  const statsEnabled = Boolean(gameId && canView && !accessLoading)
  const { game: playGame, loading: playLoading } = useGameForPlay(statsEnabled ? gameId : '')
  const { leaderboard, loading: leaderboardLoading } = useGameLeaderboard(statsEnabled ? gameId : '')
  const { communityStats, loading: communityLoading } = useGameCommunityStats(
    statsEnabled ? gameId : '',
  )

  if (!gameId) {
    return (
      <div className="page">
        <PageError message="Game not found" />
      </div>
    )
  }

  if (summaryLoading || accessLoading) {
    return (
      <div className="page">
        <PageLoading />
      </div>
    )
  }

  if (summaryError || !game) {
    return (
      <div className="page">
        <PageError message={summaryError ?? 'Game not found'} />
      </div>
    )
  }

  if (!canView) {
    return (
      <div className="page">
        <GameSummaryHero game={game} />
        <EmptyState
          title="Stats locked"
          description="Play this game to unlock the leaderboard and community picks."
          action={<PrimaryActionButton to={gamePlayPath(game.id)} label="Play game" />}
        />
      </div>
    )
  }

  const people = playGame?.people ?? []
  const statsLoading = playLoading || leaderboardLoading || communityLoading
  const yourResult = completed ? getLocalAttemptResult(completed.attemptId) : null

  return (
    <div className="page">
      <Stack spacing={2}>
        <GameSummaryHero game={game} avatarSize={44} avatarMax={4} />

        <SectionCard title="Overview">
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {formatAttemptCount(game.attemptCount)} · {game.peopleCount}{' '}
            {game.peopleCount === 1 ? 'person' : 'people'}
            {isOwner ? ' · You created this game' : null}
            {completed ? ` · Your score: ${completed.score100}` : null}
          </Typography>
        </SectionCard>

        {statsLoading && people.length === 0 ? (
          <PageLoading />
        ) : (
          <>
            <GameLeaderboardPanel
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              highlightAttemptId={completed?.attemptId}
              highlightName={yourResult?.displayNameSnapshot}
              highlightScore={completed?.score100}
            />

            <GameCommunityPanel
              communityPerPerson={communityStats}
              people={people}
              collapsible={false}
            />
          </>
        )}

        <Stack spacing={1.5}>
          {completed ? (
            <PrimaryActionButton
              to={`/attempt/${completed.attemptId}/result`}
              label={`Your score (${completed.score100})`}
            />
          ) : (
            <PrimaryActionButton to={gamePlayPath(game.id)} label="Play game" />
          )}
          {isOwner ? (
            <PrimaryActionButton to={`/game/${game.id}/edit`} label="Edit game" variant="outlined" />
          ) : null}
          <PrimaryActionButton to={gamePlayPath(game.id)} label="Back to game" variant="outlined" />
        </Stack>
      </Stack>
    </div>
  )
}
