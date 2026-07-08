import { useMemo } from 'react'
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PersonAvatar from '../components/PersonAvatar'
import { useAttemptResult } from '../hooks/useGame'

const displayFont = '"Fredoka", sans-serif'

function scoreMessage(score: number) {
  if (score >= 90) return 'Crushed it! 🎉'
  if (score >= 70) return 'Pretty good! 😎'
  if (score >= 50) return 'Not bad — room to grow'
  return 'Tough crowd today'
}

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { result, loading, error } = useAttemptResult(attemptId ?? '')

  const people = result?.people ?? []
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
  const personNameById = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people])

  const label = (partnerId: string | null) =>
    partnerId === null ? 'Single' : (personNameById.get(partnerId) ?? '?')

  if (loading) return <div className="page"><PageLoading /></div>

  if (error || !result) {
    return (
      <div className="page">
        <PageError message={error ?? 'No results'} />
      </div>
    )
  }

  return (
    <div className="page">
      <Box
        sx={{
          textAlign: 'center',
          py: 1.5,
          px: 2,
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '3px solid',
          borderColor: 'secondary.main',
          boxShadow: '0 6px 20px rgba(255, 92, 58, 0.12)',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          Your score
        </Typography>
        <Typography
          variant="h3"
          color="primary.main"
          sx={{ fontFamily: displayFont, fontWeight: 700, lineHeight: 1, mt: 0.25 }}
        >
          {result.score100}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 700 }}>
          {scoreMessage(result.score100)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
          {result.correctCount}/{result.totalQuestions} right · {result.displayNameSnapshot}
        </Typography>
      </Box>

      <Typography
        variant="subtitle2"
        sx={{ fontFamily: displayFont, fontWeight: 700, color: 'text.primary' }}
      >
        What everyone guessed
      </Typography>
      <Stack spacing={1.5} sx={{ mt: 0.5 }}>
        {result.communityPerPerson.map((x) => {
          const person = personById.get(x.personId)
          return (
            <Box key={x.personId}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  {person ? <PersonAvatar person={person} size={34} showName={false} /> : null}
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {personNameById.get(x.personId)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 600 }}>
                  {label(x.topPartnerId)} {x.topPercent}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={x.topPercent} />
            </Box>
          )
        })}
      </Stack>

      <Typography
        variant="subtitle2"
        sx={{ fontFamily: displayFont, fontWeight: 700, color: 'text.primary', mt: 0.5 }}
      >
        Your picks
      </Typography>
      <Stack
        spacing={0}
        sx={{
          mt: 0.5,
          borderRadius: 3,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {result.perPerson.map((row, i) => {
          const person = personById.get(row.personId)
          return (
            <Box
              key={row.personId}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.1,
                px: 1.25,
                gap: 1,
                borderTop: i > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                {person ? <PersonAvatar person={person} size={34} showName={false} /> : null}
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {personNameById.get(row.personId)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color={row.isCorrect ? 'success.main' : 'text.secondary'}
                sx={{ textAlign: 'right', flexShrink: 0, fontWeight: 700 }}
              >
                {row.isCorrect ? '✓' : '✗'} {label(row.selectedPartnerId)}
                {!row.isCorrect ? ` → ${label(row.correctPartnerId)}` : ''}
              </Typography>
            </Box>
          )
        })}
      </Stack>

      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ py: 1.35, mt: 1 }}
      >
        Play another
      </Button>
    </div>
  )
}
