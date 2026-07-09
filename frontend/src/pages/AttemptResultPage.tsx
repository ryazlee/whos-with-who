import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, Collapse, LinearProgress, Stack, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import GuestPlayBanner from '../components/GuestPlayBanner'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PersonAvatar from '../components/PersonAvatar'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAttemptResult } from '../hooks/useGame'

function scoreTier(score100: number): 'high' | 'mid' | 'low' {
  if (score100 >= 80) return 'high'
  if (score100 >= 50) return 'mid'
  return 'low'
}

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { result, loading, error } = useAttemptResult(attemptId ?? '')
  const [crowdOpen, setCrowdOpen] = useState(false)

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
  const hasCommunityData = result.communityPerPerson.length > 0

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

      <Box className="surfaceCard">
        {hasCommunityData ? (
          <>
            <Button
              fullWidth
              onClick={() => setCrowdOpen((v) => !v)}
              endIcon={
                <ExpandMoreOutlinedIcon
                  sx={{ transform: crowdOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              }
              sx={{
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                color: 'text.primary',
                fontWeight: 500,
                borderRadius: 0,
              }}
            >
              What everyone else guessed
            </Button>
            <Collapse in={crowdOpen}>
              <Stack spacing={1.5} sx={{ px: 2, pb: 2, pt: 0.5 }}>
                {result.communityPerPerson.map((x) => {
                  const person = personById.get(x.personId)
                  return (
                    <Box key={x.personId}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          {person ? <PersonAvatar person={person} size={28} showName={false} /> : null}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {personNameById.get(x.personId)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {partnerLabel(x.topPartnerId)} · {x.topPercent}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={x.topPercent} />
                    </Box>
                  )
                })}
              </Stack>
            </Collapse>
          </>
        ) : (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              What everyone else guessed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
              No crowd data yet — you&apos;re early. Check back after more people play.
            </Typography>
          </Box>
        )}
      </Box>

      <GuestPlayBanner />

      <Stack spacing={1.5}>
        <PrimaryActionButton to={`/game/${result.gameId}/play`} label="Review your picks" />
        <PrimaryActionButton to="/" label="Back to games" variant="outlined" />
      </Stack>
    </div>
  )
}
