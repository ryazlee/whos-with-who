import { useEffect, useMemo, useState } from 'react'
import { Button, Stack } from '@mui/material'
import { Navigate, useParams } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import EmailCodeLogin from '../components/EmailCodeLogin'
import MatchAllPlay from '../components/MatchAllPlay'
import { MatchingModeBar } from '../components/MatchingModePicker'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import SectionCard from '../components/SectionCard'
import StickyActionBar from '../components/StickyActionBar'
import TapPairsPlay from '../components/TapPairsPlay'
import { useAuth } from '../contexts/AuthContext'
import type { MatchingMode } from '../game/matchingModes'
import { isComplete as tapPairsComplete, matchAllComplete, selectionsToTapPairAssigned } from '../game/pairMatching'
import { getPreferredMatchingMode } from '../lib/matchingModePreference'
import { useGameForPlay, useMyGameAttempt, useSubmitMatchAllAttempt } from '../hooks/useGame'
import { isSupabaseEnabled } from '../services/gameService'

function emptySelections(_mode: MatchingMode): MatchAllSelections {
  return {}
}

function canSubmit(mode: MatchingMode, peopleIds: string[], selections: MatchAllSelections, allowSingle: boolean) {
  if (mode === 'tap_pairs') {
    const assigned = selectionsToTapPairAssigned(peopleIds, selections)
    return tapPairsComplete(peopleIds, assigned, allowSingle)
  }
  return matchAllComplete(peopleIds, selections, allowSingle)
}

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? 'demo'

  const { user, loading: authLoading } = useAuth()
  const needsAuth = isSupabaseEnabled && !user

  const { attempt: completedAttempt, loading: attemptLoading } = useMyGameAttempt(gameId)

  const { game, loading, error } = useGameForPlay(gameId)
  const submitAttempt = useSubmitMatchAllAttempt()

  const [activeMode, setActiveMode] = useState<MatchingMode>('tap_pairs')
  const [selections, setSelections] = useState<MatchAllSelections>({})

  const people = game?.people ?? []
  const allowSingleChoice = game?.allowSingleChoice ?? true
  const peopleIds = useMemo(() => people.map((p) => p.id), [people])

  useEffect(() => {
    if (!game) return
    const preferred = getPreferredMatchingMode()
    const mode = game.modeLocked ? game.ownerMatchingMode : (preferred ?? game.ownerMatchingMode)
    setActiveMode(mode)
    setSelections(emptySelections(mode))
  }, [game])

  useEffect(() => {
    if (!game) return
    setSelections(emptySelections(activeMode))
  }, [activeMode]) // eslint-disable-line react-hooks/exhaustive-deps -- reset picks when switching mode

  if (attemptLoading || (isSupabaseEnabled && authLoading)) {
    return <div className="page"><PageLoading /></div>
  }

  if (completedAttempt) {
    return <Navigate to={`/attempt/${completedAttempt.attemptId}/result`} replace />
  }

  if (loading) return <div className="page"><PageLoading /></div>

  if (error || !game) {
    return (
      <div className="page">
        <PageError message={error ?? 'Not found'} />
      </div>
    )
  }

  const submitReady = canSubmit(activeMode, peopleIds, selections, allowSingleChoice)

  return (
    <div className="page page--withActionBar">
      <Stack spacing={2}>
        {needsAuth ? (
          <SectionCard title="Sign in to submit" subtitle="We'll email you a one-time code. You can still match below.">
            <EmailCodeLogin compact />
          </SectionCard>
        ) : null}

        <MatchingModeBar
          ownerMode={game.ownerMatchingMode}
          modeLocked={game.modeLocked}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />

        {activeMode === 'tap_pairs' ? (
          <TapPairsPlay
            people={people}
            allowSingleChoice={allowSingleChoice}
            selections={selections}
            onChange={setSelections}
          />
        ) : (
          <MatchAllPlay
            people={people}
            allowSingleChoice={allowSingleChoice}
            selections={selections}
            onChange={setSelections}
          />
        )}
      </Stack>

      <StickyActionBar>
        <div className="stickyActionBarInner playSubmitDock">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={submitAttempt.isPending || !submitReady || needsAuth}
            onClick={() => submitAttempt.mutate({ gameId: game.gameId, selections })}
            sx={{
              py: 1.35,
              fontSize: '1rem',
              fontWeight: 600,
              maxWidth: { md: 420 },
              mx: { md: 'auto' },
              display: { md: 'block' },
            }}
          >
            {submitAttempt.isPending
              ? 'Submitting…'
              : needsAuth
                ? 'Sign in to submit'
                : submitReady
                  ? 'Submit answers'
                  : 'Match everyone first'}
          </Button>
        </div>
      </StickyActionBar>
    </div>
  )
}
