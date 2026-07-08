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
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {result.score100}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {result.correctCount}/{result.totalQuestions} correct · {result.displayNameSnapshot}
        </Typography>
      </Box>

      <Typography className="section-label" component="p">
        Crowd
      </Typography>
      <Stack spacing={1.25}>
        {result.communityPerPerson.map((x) => {
          const person = personById.get(x.personId)
          return (
            <Box key={x.personId}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  {person ? <PersonAvatar person={person} size={30} showName={false} /> : null}
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {personNameById.get(x.personId)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {label(x.topPartnerId)} {x.topPercent}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={x.topPercent} />
            </Box>
          )
        })}
      </Stack>

      <Typography className="section-label" component="p" sx={{ mt: 0.5 }}>
        You
      </Typography>
      <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {result.perPerson.map((row) => {
          const person = personById.get(row.personId)
          return (
            <Box
              key={row.personId}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.85, gap: 1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                {person ? <PersonAvatar person={person} size={30} showName={false} /> : null}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {personNameById.get(row.personId)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color={row.isCorrect ? 'success.main' : 'text.secondary'}
                sx={{ textAlign: 'right', flexShrink: 0 }}
              >
                {row.isCorrect ? '✓' : '✗'} {label(row.selectedPartnerId)}
                {!row.isCorrect ? ` → ${label(row.correctPartnerId)}` : ''}
              </Typography>
            </Box>
          )
        })}
      </Stack>

      <Button component={RouterLink} to="/" variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
        Home
      </Button>
    </div>
  )
}
