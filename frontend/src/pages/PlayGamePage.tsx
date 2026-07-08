import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Stack } from '@mui/material'
import { Navigate, useParams } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import MatchAllPlay from '../components/MatchAllPlay'
import { MatchingModeBar } from '../components/MatchingModePicker'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import TapPairsPlay from '../components/TapPairsPlay'
import type { MatchingMode } from '../game/matchingModes'
import { isComplete as tapPairsComplete, selectionsToTapPairAssigned } from '../game/pairMatching'
import { getPreferredMatchingMode } from '../lib/matchingModePreference'
import { getCompletedAttemptForGame } from '../lib/localAttempts'
import { useGameForPlay, useSubmitMatchAllAttempt } from '../hooks/useGame'

function emptySelections(
  mode: MatchingMode,
  peopleIds: string[],
  allowSingle: boolean,
  fallbackPartner?: (id: string) => string | null,
): MatchAllSelections {
  if (mode === 'tap_pairs') return {}
  const init: MatchAllSelections = {}
  for (const id of peopleIds) {
    init[id] = allowSingle ? null : (fallbackPartner?.(id) ?? null)
  }
  return init
}

function canSubmit(mode: MatchingMode, peopleIds: string[], selections: MatchAllSelections, allowSingle: boolean) {
  if (mode === 'tap_pairs') {
    const assigned = selectionsToTapPairAssigned(peopleIds, selections)
    return tapPairsComplete(peopleIds, assigned, allowSingle)
  }
  return peopleIds.every((id) => id in selections)
}

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? 'demo'

  const completed = useMemo(() => getCompletedAttemptForGame(gameId), [gameId])

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
    const ids = game.people.map((p) => p.id)
    const fallbackPartner = (id: string) =>
      game.people.find((x) => x.id !== id)?.id ?? null
    setSelections(emptySelections(mode, ids, game.allowSingleChoice, fallbackPartner))
  }, [game])

  useEffect(() => {
    if (!game) return
    const fallbackPartner = (id: string) =>
      people.find((x) => x.id !== id)?.id ?? null
    setSelections(emptySelections(activeMode, peopleIds, allowSingleChoice, fallbackPartner))
  }, [activeMode]) // eslint-disable-line react-hooks/exhaustive-deps -- reset picks when switching mode

  if (completed) {
    return <Navigate to={`/attempt/${completed.attemptId}/result`} replace />
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
    <div className="page">
      <Stack spacing={2}>
        <MatchingModeBar
          ownerMode={game.ownerMatchingMode}
          modeLocked={game.modeLocked}
          activeMode={activeMode}
          onModeChange={(mode) => {
            setActiveMode(mode)
          }}
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

      <Box sx={{ position: 'sticky', bottom: 80, pt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={submitAttempt.isPending || !submitReady}
          onClick={() => submitAttempt.mutate({ gameId: game.gameId, selections })}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          {submitAttempt.isPending ? '…' : 'Submit'}
        </Button>
      </Box>
    </div>
  )
}
