import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import GameCommunityPanel from '../components/GameCommunityPanel'
import GameLeaderboardPanel from '../components/GameLeaderboardPanel'
import GameSummaryHero from '../components/GameSummaryHero'
import Page from '../components/Page'
import PageActionStack from '../components/PageActionStack'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PageQueryState from '../components/PageQueryState'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import {
  useCanViewGameStats,
  useGameCommunityStats,
  useGameForEdit,
  useGameForPlay,
  useGameLeaderboard,
  useGameSummary,
} from '../hooks/useGame'
import { useCorrectPartnerIdByPerson } from '../hooks/useCorrectPartnerIdByPerson'
import { formatAttemptCount } from '../lib/formatters'
import { getLocalAttemptResult } from '../lib/localAttempts'
import { gamePlayPath } from '../lib/gameUrl'
import { formatScore } from '../lib/formatScore'

export default function GameStatsPage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? ''

  const { canView, completed, isOwner, loading: accessLoading } = useCanViewGameStats(gameId)
  const { game, loading: summaryLoading, error: summaryError } = useGameSummary(gameId)
  const { game: editGame } = useGameForEdit(isOwner ? gameId : '')

  const statsEnabled = Boolean(gameId && canView && !accessLoading)
  const { game: playGame, loading: playLoading } = useGameForPlay(statsEnabled ? gameId : '')
  const { leaderboard, loading: leaderboardLoading } = useGameLeaderboard(statsEnabled ? gameId : '')
  const { communityStats, loading: communityLoading } = useGameCommunityStats(
    statsEnabled ? gameId : '',
  )

  const yourResult = completed ? getLocalAttemptResult(completed.attemptId) : null
  const correctPartnerIdByPerson = useCorrectPartnerIdByPerson({
    attemptResult: yourResult,
    ownerRelationships: isOwner ? editGame?.relationships : undefined,
  })
  const people = playGame?.people ?? []
  const statsLoading = playLoading || leaderboardLoading || communityLoading

  if (!gameId) {
    return (
      <Page>
        <PageError message="Game not found" />
      </Page>
    )
  }

  return (
    <PageQueryState
      loading={summaryLoading || accessLoading}
      error={summaryError}
      missing={!game}
      missingMessage="Game not found"
    >
      {game ? (
        !canView ? (
          <Page>
            <GameSummaryHero game={game} />
            <EmptyState
              title="Stats locked"
              description="Play this game to unlock the leaderboard and community picks."
              action={<PrimaryActionButton to={gamePlayPath(game.id)} label="Play game" />}
            />
          </Page>
        ) : (
          <Page>
            <Stack spacing={2}>
              <GameSummaryHero game={game} avatarSize={44} avatarMax={4} />

              <SectionCard title="Overview">
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {formatAttemptCount(game.attemptCount)} · {game.peopleCount}{' '}
                  {game.peopleCount === 1 ? 'person' : 'people'}
                  {isOwner ? ' · You created this game' : null}
                  {completed ? ` · Your score: ${formatScore(completed.score100)}` : null}
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
                    highlightDurationMs={yourResult?.durationMs}
                  />

                  <GameCommunityPanel
                    communityPerPerson={communityStats}
                    people={people}
                    correctPartnerIdByPerson={correctPartnerIdByPerson}
                    collapsible={false}
                  />
                </>
              )}

              <PageActionStack>
                {completed ? (
                  <PrimaryActionButton
                    to={`/attempt/${completed.attemptId}/result`}
                    label={`Your score (${formatScore(completed.score100)})`}
                  />
                ) : (
                  <PrimaryActionButton to={gamePlayPath(game.id)} label="Play game" />
                )}
                {isOwner ? (
                  <PrimaryActionButton to={`/game/${game.id}/edit`} label="Edit game" variant="outlined" />
                ) : null}
                <PrimaryActionButton to={gamePlayPath(game.id)} label="Back to game" variant="outlined" />
              </PageActionStack>
            </Stack>
          </Page>
        )
      ) : null}
    </PageQueryState>
  )
}
