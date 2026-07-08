import { Typography } from '@mui/material'
import PageHeader from '../components/PageHeader'
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
      <PageHeader
        title="Play"
        subtitle="Guess the couples — one try per game."
      />

      {dailyLoading ? (
        <PageLoading />
      ) : dailyError ? (
        <PageError message={dailyError} />
      ) : daily ? (
        <GameCard game={daily.game} featured dailyDate={daily.date} />
      ) : null}

      {feedGames.length > 0 || gamesLoading ? (
        <Typography className="section-label" component="p">
          More games
        </Typography>
      ) : null}

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
