import { useEffect, useMemo, useState } from 'react'
import { Stack } from '@mui/material'
import { Navigate, useParams } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import DrawLinesPlay from '../components/DrawLinesPlay'
import GuestPlayBanner, { GuestPlayHint } from '../components/GuestPlayBanner'
import GameSummaryHero from '../components/GameSummaryHero'
import MatchAllPlay from '../components/MatchAllPlay'
import { MatchingModeBar } from '../components/MatchingModePicker'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import StickyActionBar from '../components/StickyActionBar'
import TapPairsPlay from '../components/TapPairsPlay'
import PrimaryActionButton from '../components/PrimaryActionButton'
import type { MatchingMode } from '../game/matchingModes'
import { normalizeAllowedModes } from '../game/matchingModes'
import { isComplete as tapPairsComplete, matchAllComplete, selectionsToTapPairAssigned } from '../game/pairMatching'
import { getPreferredMatchingMode } from '../lib/matchingModePreference'
import { useGameForPlay, useGameSummary, useMyGameAttempt, useSubmitMatchAllAttempt } from '../hooks/useGame'

function emptySelections(_mode: MatchingMode): MatchAllSelections {
  return {}
}

function canSubmit(mode: MatchingMode, peopleIds: string[], selections: MatchAllSelections, allowSingle: boolean) {
  if (mode === 'match_all') {
    return matchAllComplete(peopleIds, selections, allowSingle)
  }
  const assigned = selectionsToTapPairAssigned(peopleIds, selections)
  return tapPairsComplete(peopleIds, assigned, allowSingle)
}

function pickInitialMode(game: {
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  allowedMatchingModes: MatchingMode[]
}): MatchingMode {
  const allowed = normalizeAllowedModes(game.allowedMatchingModes)
  if (game.modeLocked) return game.ownerMatchingMode
  const preferred = getPreferredMatchingMode()
  if (preferred && allowed.includes(preferred)) return preferred
  return allowed[0] ?? game.ownerMatchingMode
}

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>()
  const gameId = id ?? 'demo'

  const { attempt: completedAttempt, loading: attemptLoading } = useMyGameAttempt(gameId)

  const { game, loading, error } = useGameForPlay(gameId)
  const { game: gameSummary } = useGameSummary(gameId)
  const submitAttempt = useSubmitMatchAllAttempt()

  const [activeMode, setActiveMode] = useState<MatchingMode>('tap_pairs')
  const [selections, setSelections] = useState<MatchAllSelections>({})

  const people = game?.people ?? []
  const allowSingleChoice = game?.allowSingleChoice ?? true
  const peopleIds = useMemo(() => people.map((p) => p.id), [people])
  const allowedModes = useMemo(
    () => normalizeAllowedModes(game?.allowedMatchingModes),
    [game?.allowedMatchingModes],
  )

  useEffect(() => {
    if (!game) return
    const mode = pickInitialMode(game)
    setActiveMode(mode)
    setSelections(emptySelections(mode))
  }, [game])

  useEffect(() => {
    if (!game || game.modeLocked) return
    if (!allowedModes.includes(activeMode)) {
      setActiveMode(allowedModes[0] ?? game.ownerMatchingMode)
    }
  }, [activeMode, allowedModes, game])

  useEffect(() => {
    if (!game) return
    setSelections(emptySelections(activeMode))
  }, [activeMode]) // eslint-disable-line react-hooks/exhaustive-deps -- reset picks when switching mode

  if (attemptLoading) {
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
        {gameSummary ? <GameSummaryHero game={gameSummary} avatarSize={44} avatarMax={3} /> : null}

        <GuestPlayBanner variant="play" />

        <MatchingModeBar
          allowedModes={allowedModes}
          modeLocked={game.modeLocked}
          lockedMode={game.ownerMatchingMode}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />

        {activeMode === 'draw_lines' ? (
          <DrawLinesPlay
            people={people}
            allowSingleChoice={allowSingleChoice}
            selections={selections}
            onChange={setSelections}
          />
        ) : activeMode === 'tap_pairs' ? (
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
          <Stack spacing={0.75}>
            <PrimaryActionButton
              disabled={submitAttempt.isPending || !submitReady}
              onClick={() => submitAttempt.mutate({ gameId: game.gameId, selections })}
              label={
                submitAttempt.isPending
                  ? 'Submitting…'
                  : submitReady
                    ? 'Submit answers'
                    : 'Match everyone first'
              }
            />
            <GuestPlayHint />
          </Stack>
        </div>
      </StickyActionBar>
    </div>
  )
}
