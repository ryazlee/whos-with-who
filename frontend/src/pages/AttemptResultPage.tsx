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
      <Box sx={{ textAlign: 'center', py: 1 }}>
        <Typography variant="h3" color="primary.main" sx={{ fontWeight: 600, lineHeight: 1 }}>
          {result.score100}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {result.correctCount}/{result.totalQuestions} · {result.displayNameSnapshot}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
        CROWD
      </Typography>
      <Stack spacing={1.25} sx={{ mt: 0.75 }}>
        {result.communityPerPerson.map((x) => {
          const person = personById.get(x.personId)
          return (
          <Box key={x.personId}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                {person ? <PersonAvatar person={person} size={32} showName={false} /> : null}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {personNameById.get(x.personId)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                {label(x.topPartnerId)} {x.topPercent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={x.topPercent} sx={{ height: 4, borderRadius: 2 }} />
          </Box>
        )})}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em', mt: 1 }}>
        YOU
      </Typography>
      <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />} sx={{ mt: 0.75 }}>
        {result.perPerson.map((row) => {
          const person = personById.get(row.personId)
          return (
          <Box
            key={row.personId}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, gap: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              {person ? <PersonAvatar person={person} size={32} /> : null}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {personNameById.get(row.personId)}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color={row.isCorrect ? 'primary.main' : 'text.secondary'}
              sx={{ textAlign: 'right', flexShrink: 0 }}
            >
              {row.isCorrect ? '✓' : '✗'} {label(row.selectedPartnerId)}
              {!row.isCorrect ? ` → ${label(row.correctPartnerId)}` : ''}
            </Typography>
          </Box>
        )})}
      </Stack>

      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ borderRadius: 2, py: 1.25, mt: 2 }}
      >
        Home
      </Button>
    </div>
  )
}
