import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import GuestPlayBanner from '../components/GuestPlayBanner'
import GameCommunityPanel from '../components/GameCommunityPanel'
import GameLeaderboardPanel from '../components/GameLeaderboardPanel'
import Page from '../components/Page'
import PageActionStack from '../components/PageActionStack'
import PageQueryState from '../components/PageQueryState'
import PersonAvatar from '../components/PersonAvatar'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAttemptResult, useGameLeaderboard } from '../hooks/useGame'
import { correctPartnerIdFromAttemptResult } from '../lib/answerKey'
import { gameStatsPath } from '../lib/gameUrl'
import { buildPersonById, buildPersonNameById } from '../lib/personMaps'

import { formatDuration, formatScore, scoreDisplayPoints } from '../lib/formatScore'

function scoreTier(score100: number, durationMs?: number | null): 'high' | 'mid' | 'low' {
  const points = scoreDisplayPoints(score100, durationMs)
  if (points >= 80) return 'high'
  if (points >= 50) return 'mid'
  return 'low'
}

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { result, loading, error } = useAttemptResult(attemptId ?? '')
  const { leaderboard, loading: leaderboardLoading } = useGameLeaderboard(result?.gameId ?? '')

  const people = result?.people ?? []
  const personById = useMemo(() => buildPersonById(people), [people])
  const personNameById = useMemo(() => buildPersonNameById(people), [people])

  const partnerLabel = (partnerId: string | null) =>
    partnerId === null ? 'Single' : (personNameById.get(partnerId) ?? '?')

  const correctAnswerText = (partnerId: string | null) =>
    partnerId === null ? 'Single' : `With ${partnerLabel(partnerId)}`

  const correctPartnerIdByPerson = useMemo(
    () => (result ? correctPartnerIdFromAttemptResult(result) : undefined),
    [result],
  )

  return (
    <PageQueryState loading={loading} error={error} missing={!result} missingMessage="No results">
      {result ? (
        <Page>
          <Box className={`resultHero resultHero--${scoreTier(result.score100, result.durationMs)}`}>
            <Typography component="p" className="resultHero__score">
              {formatScore(result.score100, result.durationMs)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              out of 100
              {result.durationMs != null ? ` · ${formatDuration(result.durationMs)}` : ''}
            </Typography>

            <Box className="resultHero__summary">
              <span className="resultStat resultStat--correct">{result.correctCount} correct</span>
              {result.totalQuestions - result.correctCount > 0 ? (
                <span className="resultStat resultStat--wrong">
                  {result.totalQuestions - result.correctCount} missed
                </span>
              ) : null}
            </Box>

            <Box className="resultHero__bar" aria-hidden>
              <Box
                className="resultHero__barFill"
                sx={{
                  width: `${
                    result.totalQuestions > 0
                      ? Math.round((result.correctCount / result.totalQuestions) * 100)
                      : 0
                  }%`,
                }}
              />
            </Box>

            <Typography component="span" className="resultHero__player">
              {result.displayNameSnapshot}
            </Typography>
          </Box>

          <SectionCard title="Your picks" noPadding>
            <Box className="resultPickList">
              {result.perPerson.map((row) => {
                const person = personById.get(row.personId)
                const isCorrect = row.isCorrect

                return (
                  <Box
                    key={row.personId}
                    className={
                      isCorrect ? 'resultPickRow resultPickRow--correct' : 'resultPickRow resultPickRow--wrong'
                    }
                  >
                    {person ? <PersonAvatar person={person} size={40} showName={false} /> : null}
                    <Box className="resultPickRow__body">
                      <Typography component="p" className="resultPickRow__name">
                        {personNameById.get(row.personId)}
                      </Typography>
                      {isCorrect ? (
                        <Typography component="p" className="resultPickRow__answer resultPickRow__answer--correct">
                          {correctAnswerText(row.selectedPartnerId)}
                        </Typography>
                      ) : (
                        <>
                          <Typography component="p" className="resultPickRow__answer resultPickRow__answer--yours">
                            Your pick: {partnerLabel(row.selectedPartnerId)}
                          </Typography>
                          <Typography
                            component="p"
                            className="resultPickRow__answer resultPickRow__answer--correctAnswer"
                          >
                            Correct: {partnerLabel(row.correctPartnerId)}
                          </Typography>
                        </>
                      )}
                    </Box>
                    <span
                      className="resultPickRow__badge"
                      aria-label={isCorrect ? 'Correct' : 'Incorrect'}
                    >
                      {isCorrect ? (
                        <CheckRoundedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                      )}
                    </span>
                  </Box>
                )
              })}
            </Box>
          </SectionCard>

          <GameLeaderboardPanel
            leaderboard={leaderboard}
            loading={leaderboardLoading}
            highlightAttemptId={result.attemptId}
            highlightName={result.displayNameSnapshot}
            highlightScore={result.score100}
            highlightDurationMs={result.durationMs}
          />

          <GameCommunityPanel
            communityPerPerson={result.communityPerPerson}
            people={people}
            correctPartnerIdByPerson={correctPartnerIdByPerson}
            collapsible
          />

          <GuestPlayBanner />

          <PageActionStack>
            <PrimaryActionButton to={gameStatsPath(result.gameId)} label="Full game stats" />
            <PrimaryActionButton to={`/game/${result.gameId}/play`} label="Review your picks" variant="outlined" />
            <PrimaryActionButton to="/" label="Back to games" variant="outlined" />
          </PageActionStack>
        </Page>
      ) : null}
    </PageQueryState>
  )
}
