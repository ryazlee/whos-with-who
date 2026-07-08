import { Box, Typography } from '@mui/material'
import GameCard from '../components/GameCard'
import GameGrid from '../components/GameGrid'
import PageError from '../components/PageError'
import PageLoading from '../components/PageLoading'
import { useDailyChallenge, usePopularGames } from '../hooks/useGame'

export default function HomePage() {
  const { daily, loading: dailyLoading, error: dailyError } = useDailyChallenge()
  const { games, loading: gamesLoading, error: gamesError } = usePopularGames()

  const feedGames = games.filter((g) => g.id !== daily?.game.id)

  return (
    <div className="page">
      {dailyLoading ? (
        <PageLoading />
      ) : dailyError ? (
        <PageError message={dailyError} />
      ) : daily ? (
        <GameCard game={daily.game} featured dailyDate={daily.date} />
      ) : null}

      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mt: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Popular tonight
        </Typography>
        {!gamesLoading && feedGames.length > 0 ? (
          <Typography variant="caption" color="text.secondary">
            {feedGames.length} games
          </Typography>
        ) : null}
      </Box>

      {gamesLoading ? (
        <PageLoading />
      ) : gamesError ? (
        <PageError message={gamesError} />
      ) : (
        <GameGrid>
          {feedGames.map((game) => (
            <GameCard key={game.id} game={game} compact />
          ))}
        </GameGrid>
      )}
    </div>
  )
}
