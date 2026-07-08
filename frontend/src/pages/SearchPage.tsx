import { Typography } from '@mui/material'
import GameCard from '../components/GameCard'
import GameGrid from '../components/GameGrid'
import { MOCK_GAMES } from '../game/mockGames'

export default function SearchPage() {
  const publicGames = MOCK_GAMES.filter((g) => g.visibility === 'public')

  return (
    <div className="page">
      <div>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          Search
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Browse public games.
        </Typography>
      </div>

      <GameGrid>
        {publicGames.map((g) => (
          <GameCard
            key={g.id}
            compact
            game={{
              id: g.id,
              title: g.title,
              description: g.description,
              tags: g.tags,
              visibility: g.visibility,
              attemptCount: g.attemptCount,
              peopleCount: g.people.length,
              ownerMatchingMode: g.ownerMatchingMode,
              modeLocked: g.modeLocked,
              previewPeople: g.people.slice(0, 5).map((p) => ({
                id: p.id,
                name: p.name,
                imageUrl: p.imageUrl,
              })),
            }}
          />
        ))}
      </GameGrid>
    </div>
  )
}
