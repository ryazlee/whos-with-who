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
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          Who&apos;s With Who?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Guess the couples. One try per game.
        </Typography>
      </Box>

      {dailyLoading ? (
        <PageLoading />
      ) : dailyError ? (
        <PageError message={dailyError} />
      ) : daily ? (
        <GameCard game={daily.game} featured dailyDate={daily.date} />
      ) : null}

      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
        <Typography className="section-label" component="p">
          More games
        </Typography>
        {!gamesLoading && feedGames.length > 0 ? (
          <Typography variant="caption" color="text.secondary">
            {feedGames.length}
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
