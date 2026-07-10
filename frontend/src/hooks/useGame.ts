import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { MatchAllSelections } from '../datastore/types'
import { getOrCreateDisplayName } from '../lib/displayName'
import { useAuth } from '../contexts/AuthContext'
import {
  getAttemptResult,
  getDailyChallenge,
  getGameCommunityStats,
  getGameForPlay,
  getGameLeaderboard,
  getGameSummary,
  getMyAttemptForGame,
  listPopularGames,
  submitMatchAllAttempt,
} from '../services/gameService'
import { listCompletedGameAttempts, findCompletedAttemptForRef } from '../lib/localAttempts'
import {
  deleteGame,
  listMyGames,
  updateGameVisibility,
} from '../services/myGames'
import { getGameForEdit, updateGame } from '../services/updateGame'
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

export function useGameLeaderboard(gameId: string) {
  const query = useQuery({
    queryKey: queryKeys.gameLeaderboard(gameId),
    queryFn: () => getGameLeaderboard(gameId),
    enabled: Boolean(gameId),
    staleTime: 30_000,
  })

  return {
    leaderboard: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load leaderboard')
      : null,
  }
}

export function useGameCommunityStats(gameId: string) {
  const query = useQuery({
    queryKey: queryKeys.gameCommunityStats(gameId),
    queryFn: () => getGameCommunityStats(gameId),
    enabled: Boolean(gameId),
    staleTime: 30_000,
  })

  return {
    communityStats: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load community stats')
      : null,
  }
}

export function useSubmitMatchAllAttempt(getDurationMs: () => number) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (args: { gameId: string; selections: MatchAllSelections }) =>
      submitMatchAllAttempt({
        ...args,
        displayNameSnapshot: user?.email ?? getOrCreateDisplayName(),
        durationMs: getDurationMs(),
      }),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attemptResult(attempt.attemptId), attempt)
      queryClient.setQueryData(queryKeys.myGameAttempt(attempt.gameId), attempt)
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameLeaderboard(attempt.gameId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameCommunityStats(attempt.gameId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.playedGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary(attempt.gameId) })
      navigate(`/attempt/${attempt.attemptId}/result`)
    },
  })
}

export function usePlayedGames() {
  const query = useQuery({
    queryKey: queryKeys.playedGames,
    queryFn: async () => {
      const refs = listCompletedGameAttempts()
      return Promise.all(
        refs.map(async (ref) => {
          try {
            const summary = await getGameSummary(ref.gameId)
            return { ref, summary }
          } catch {
            return { ref, summary: null }
          }
        }),
      )
    },
  })

  return {
    playedGames: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load played games')
      : null,
  }
}

export function useMyGames() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: queryKeys.myGames,
    queryFn: listMyGames,
    enabled: Boolean(user),
  })

  return {
    games: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load your games')
      : null,
    refetch: query.refetch,
  }
}

export function useCanViewGameStats(gameId: string) {
  const { user, loading: authLoading } = useAuth()
  const { games, loading: myGamesLoading } = useMyGames()
  const completed = findCompletedAttemptForRef(gameId)
  const isOwner = Boolean(user && games.some((game) => game.id === gameId))

  return {
    canView: Boolean(completed || isOwner),
    completed,
    isOwner,
    loading: authLoading || (Boolean(user) && myGamesLoading),
  }
}

export function useUpdateGameVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: { gameRef: string; visibility: 'public' | 'unlisted' }) =>
      updateGameVisibility(args.gameRef, args.visibility),
    onSuccess: (_data, args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary(args.gameRef) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameForEdit(args.gameRef) })
    },
  })
}

export function useGameForEdit(gameRef: string) {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: queryKeys.gameForEdit(gameRef),
    queryFn: () => getGameForEdit(gameRef),
    enabled: Boolean(gameRef && user),
  })

  return {
    game: query.data,
    loading: query.isLoading,
    error: query.error
      ? getQueryErrorMessage(query.error, 'Failed to load game for editing')
      : null,
  }
}

export function useUpdateGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: Parameters<typeof updateGame>[0]) => updateGame(args),
    onSuccess: (_data, args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameSummary(args.gameRef) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameForEdit(args.gameRef) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameForPlay(args.gameRef) })
    },
  })
}

export function useDeleteGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameRef: string) => deleteGame(gameRef),
    onSuccess: (_data, gameRef) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      void queryClient.removeQueries({ queryKey: queryKeys.gameSummary(gameRef) })
    },
  })
}
