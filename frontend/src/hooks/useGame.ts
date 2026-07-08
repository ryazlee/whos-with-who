import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import { getOrCreateDisplayName } from '../lib/displayName'
import { useAuth } from '../contexts/AuthContext'
import {
  getAttemptResult,
  getDailyChallenge,
  getGameForPlay,
  getGameSummary,
  getMyAttemptForGame,
  listPopularGames,
  submitMatchAllAttempt,
} from '../services/gameService'
import { queryKeys } from './queryKeys'

function getQueryErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function usePopularGames() {
  const query = useQuery({
    queryKey: queryKeys.popularGames,
    queryFn: listPopularGames,
  })

  return {
    games: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load games')
      : null,
  }
}

export function useDailyChallenge() {
  const query = useQuery({
    queryKey: queryKeys.dailyChallenge,
    queryFn: getDailyChallenge,
  })

  return {
    daily: query.data,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load daily challenge')
      : null,
  }
}

export function useGameSummary(gameId: string) {
  const query = useQuery({
    queryKey: queryKeys.gameSummary(gameId),
    queryFn: () => getGameSummary(gameId),
    enabled: Boolean(gameId),
  })

  return {
    game: query.data,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load game')
      : null,
  }
}

export function useGameForPlay(gameId: string) {
  const query = useQuery({
    queryKey: queryKeys.gameForPlay(gameId),
    queryFn: () => getGameForPlay(gameId),
    enabled: Boolean(gameId),
  })

  return {
    game: query.data,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load game')
      : null,
  }
}

export function useMyGameAttempt(gameId: string) {
  const query = useQuery({
    queryKey: queryKeys.myGameAttempt(gameId),
    queryFn: () => getMyAttemptForGame(gameId),
    enabled: Boolean(gameId),
    staleTime: Infinity,
  })

  return {
    attempt: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load your score')
      : null,
  }
}

export function useAttemptResult(attemptId: string) {
  const query = useQuery({
    queryKey: queryKeys.attemptResult(attemptId),
    queryFn: () => getAttemptResult(attemptId),
    enabled: Boolean(attemptId),
  })

  return {
    result: query.data,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load results')
      : null,
  }
}

export function useSubmitMatchAllAttempt() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (args: { gameId: string; selections: MatchAllSelections }) =>
      submitMatchAllAttempt({
        ...args,
        displayNameSnapshot: user?.email ?? getOrCreateDisplayName(),
      }),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attemptResult(attempt.attemptId), attempt)
      queryClient.setQueryData(queryKeys.myGameAttempt(attempt.gameId), attempt)
      navigate(`/attempt/${attempt.attemptId}/result`)
    },
  })
}
