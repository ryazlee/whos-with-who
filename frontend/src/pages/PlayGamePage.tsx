import { useEffect, useMemo, useState } from 'react'
import { Stack } from '@mui/material'
import { useParams } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import AlreadyPlayedBanner from '../components/AlreadyPlayedBanner'
import DrawLinesPlay from '../components/DrawLinesPlay'
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
import { gamePairingShape } from '../game/pairMatching'
import { isComplete as tapPairsComplete, matchAllComplete, selectionsToTapPairAssigned } from '../game/pairMatching'
import { selectionsFromAttemptResult } from '../lib/attemptSelections'
import { applyAutoSinglesIfNeeded } from '../game/pairMatching'
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
  const isReview = Boolean(completedAttempt)

  const { game, loading, error } = useGameForPlay(gameId)
  const { game: gameSummary } = useGameSummary(gameId)
  const submitAttempt = useSubmitMatchAllAttempt()

  const [activeMode, setActiveMode] = useState<MatchingMode>('tap_pairs')
  const [selections, setSelections] = useState<MatchAllSelections>({})

  const people = game?.people ?? []
  const allowSingleChoice = game?.allowSingleChoice ?? true
  const singleCount = game?.singleCount ?? 0
  const { pairCount: pairsInGame } = gamePairingShape(people.length, singleCount)
  const peopleIds = useMemo(() => people.map((p) => p.id), [people])
  const allowedModes = useMemo(
    () => normalizeAllowedModes(game?.allowedMatchingModes),
    [game?.allowedMatchingModes],
  )

  useEffect(() => {
    if (!game) return
    const mode = pickInitialMode(game)
    setActiveMode(mode)
    if (completedAttempt) {
      setSelections(selectionsFromAttemptResult(completedAttempt))
    } else {
      setSelections(emptySelections(mode))
    }
  }, [game, completedAttempt])

  useEffect(() => {
    if (!game || game.modeLocked) return
    if (!allowedModes.includes(activeMode)) {
      setActiveMode(allowedModes[0] ?? game.ownerMatchingMode)
    }
  }, [activeMode, allowedModes, game])

  useEffect(() => {
    if (!game || isReview) return
    setSelections(emptySelections(activeMode))
  }, [activeMode]) // eslint-disable-line react-hooks/exhaustive-deps -- reset picks when switching mode

  useEffect(() => {
    if (!game || isReview) return
    setSelections((current) =>
      applyAutoSinglesIfNeeded(peopleIds, singleCount, current, allowSingleChoice),
    )
  }, [game, isReview, peopleIds, singleCount, allowSingleChoice, selections])

  if (attemptLoading || loading) {
    return <div className="page"><PageLoading /></div>
  }

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

        {completedAttempt ? <AlreadyPlayedBanner attempt={completedAttempt} /> : null}

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
            singlesInGame={singleCount}
            pairsInGame={pairsInGame}
            selections={selections}
            onChange={setSelections}
            readOnly={isReview}
          />
        ) : activeMode === 'tap_pairs' ? (
          <TapPairsPlay
            people={people}
            allowSingleChoice={allowSingleChoice}
            singlesInGame={singleCount}
            pairsInGame={pairsInGame}
            selections={selections}
            onChange={setSelections}
            readOnly={isReview}
          />
        ) : (
          <MatchAllPlay
            people={people}
            allowSingleChoice={allowSingleChoice}
            singlesInGame={singleCount}
            pairsInGame={pairsInGame}
            selections={selections}
            onChange={setSelections}
            readOnly={isReview}
          />
        )}
      </Stack>

      <StickyActionBar>
        <div className="stickyActionBarInner playSubmitDock">
          {isReview && completedAttempt ? (
            <PrimaryActionButton
              to={`/attempt/${completedAttempt.attemptId}/result`}
              label="View score"
            />
          ) : (
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
          )}
        </div>
      </StickyActionBar>
    </div>
  )
}
