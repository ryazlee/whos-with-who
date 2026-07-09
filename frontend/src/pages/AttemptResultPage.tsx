import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Collapse,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import GuestPlayBanner from '../components/GuestPlayBanner'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import PersonAvatar from '../components/PersonAvatar'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAttemptResult } from '../hooks/useGame'

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { result, loading, error } = useAttemptResult(attemptId ?? '')
  const [crowdOpen, setCrowdOpen] = useState(false)

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

  const correctPct = result.totalQuestions > 0
    ? Math.round((result.correctCount / result.totalQuestions) * 100)
    : 0

  return (
    <div className="page">
      <Box className="surfaceCard" sx={{ p: 2.5, textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontSize: '3rem',
          }}
        >
          {result.score100}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {result.correctCount} of {result.totalQuestions} correct
        </Typography>
        <LinearProgress
          variant="determinate"
          value={correctPct}
          sx={{ mt: 1.75, height: 6, borderRadius: 99 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {result.displayNameSnapshot}
        </Typography>
      </Box>

      <SectionCard title="Your picks" noPadding>
        <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          {result.perPerson.map((row) => {
            const person = personById.get(row.personId)
            return (
              <Box
                key={row.personId}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.15, gap: 1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                  {person ? <PersonAvatar person={person} size={36} showName={false} /> : null}
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {personNameById.get(row.personId)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color={row.isCorrect ? 'success.main' : 'error.main'}
                  sx={{ textAlign: 'right', flexShrink: 0, fontWeight: 500 }}
                >
                  {row.isCorrect ? '✓' : '✗'} {label(row.selectedPartnerId)}
                  {!row.isCorrect ? (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 400 }}>
                      → {label(row.correctPartnerId)}
                    </Typography>
                  ) : null}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      </SectionCard>

      <Box className="surfaceCard">
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
                      {label(x.topPartnerId)} · {x.topPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={x.topPercent} />
                </Box>
              )
            })}
          </Stack>
        </Collapse>
      </Box>

      <GuestPlayBanner variant="result" />

      <PrimaryActionButton to="/" label="Back to games" />
    </div>
  )
}
