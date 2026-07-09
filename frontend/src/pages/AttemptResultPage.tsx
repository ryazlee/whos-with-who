import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import GuestPlayBanner from '../components/GuestPlayBanner'
import GameCommunityPanel from '../components/GameCommunityPanel'
import GameLeaderboardPanel from '../components/GameLeaderboardPanel'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PersonAvatar from '../components/PersonAvatar'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAttemptResult, useGameLeaderboard } from '../hooks/useGame'
import { gameStatsPath } from '../lib/gameUrl'

function scoreTier(score100: number): 'high' | 'mid' | 'low' {
  if (score100 >= 80) return 'high'
  if (score100 >= 50) return 'mid'
  return 'low'
}

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { result, loading, error } = useAttemptResult(attemptId ?? '')
  const { leaderboard, loading: leaderboardLoading } = useGameLeaderboard(result?.gameId ?? '')

  const people = result?.people ?? []
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const personNameById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people])

  const partnerLabel = (partnerId: string | null) =>
    partnerId === null ? 'Single' : (personNameById.get(partnerId) ?? '?')

  const correctAnswerText = (partnerId: string | null) =>
    partnerId === null ? 'Single' : `With ${partnerLabel(partnerId)}`

  if (loading) return <div className="page"><PageLoading /></div>

  if (error || !result) {
    return (
      <div className="page">
        <PageError message={error ?? 'No results'} />
      </div>
    )
  }

  const correctPct = result.totalQuestions > 0
    ? Math.round((result.correctCount / result.totalQuestions) * 100)
    : 0
  const wrongCount = result.totalQuestions - result.correctCount
  const tier = scoreTier(result.score100)

  return (
    <div className="page">
      <Box className={`resultHero resultHero--${tier}`}>
        <Typography component="p" className="resultHero__score">
          {result.score100}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          out of 100
        </Typography>

        <Box className="resultHero__summary">
          <span className="resultStat resultStat--correct">{result.correctCount} correct</span>
          {wrongCount > 0 ? (
            <span className="resultStat resultStat--wrong">{wrongCount} missed</span>
          ) : null}
        </Box>

        <Box className="resultHero__bar" aria-hidden>
          <Box className="resultHero__barFill" sx={{ width: `${correctPct}%` }} />
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
                className={isCorrect ? 'resultPickRow resultPickRow--correct' : 'resultPickRow resultPickRow--wrong'}
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
      />

      <GameCommunityPanel
        communityPerPerson={result.communityPerPerson}
        people={people}
        collapsible
      />

      <GuestPlayBanner />

      <Stack spacing={1.5}>
        <PrimaryActionButton to={gameStatsPath(result.gameId)} label="Full game stats" />
        <PrimaryActionButton to={`/game/${result.gameId}/play`} label="Review your picks" variant="outlined" />
        <PrimaryActionButton to="/" label="Back to games" variant="outlined" />
      </Stack>
    </div>
  )
}
