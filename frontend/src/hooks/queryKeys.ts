export const queryKeys = {
  popularGames: ['popular-games'] as const,
  dailyChallenge: ['daily-challenge'] as const,
  myGames: ['my-games'] as const,
  gameSummary: (gameId: string) => ['game-summary', gameId] as const,
  gameForEdit: (gameId: string) => ['game-for-edit', gameId] as const,
  gameForPlay: (gameId: string) => ['game-for-play', gameId] as const,
  myGameAttempt: (gameId: string) => ['my-game-attempt', gameId] as const,
  attemptResult: (attemptId: string) => ['attempt-result', attemptId] as const,
}
