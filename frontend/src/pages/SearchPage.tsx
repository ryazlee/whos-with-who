import GameCard from '../components/GameCard'
import GameGrid from '../components/GameGrid'
import Page from '../components/Page'
import PageError from '../components/PageError'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import { usePopularGames } from '../hooks/useGame'

export default function SearchPage() {
  const { games, loading, error } = usePopularGames()

  return (
    <Page>
      <PageHeader
        title="Browse"
        subtitle="Public games you can play right now."
      />

      {loading ? (
        <PageLoading />
      ) : error ? (
        <PageError message={error} />
      ) : (
        <GameGrid>
          {games.map((g) => (
            <GameCard key={g.id} compact game={g} />
          ))}
        </GameGrid>
      )}
    </Page>
  )
}
