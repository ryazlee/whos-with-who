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
      <Box sx={{ mb: -0.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Fredoka", sans-serif',
            fontWeight: 700,
            lineHeight: 1.15,
            fontSize: '1.35rem',
          }}
        >
          Who&apos;s with who? 🤔
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, fontWeight: 600 }}>
          One guess per game. Match the couples!
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
        <Typography
          variant="subtitle2"
          sx={{ fontFamily: '"Fredoka", sans-serif', fontWeight: 700, color: 'text.primary' }}
        >
          More games
        </Typography>
        {!gamesLoading && feedGames.length > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {feedGames.length} to try
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
