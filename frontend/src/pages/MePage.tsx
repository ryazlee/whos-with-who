import { Button, Stack, Typography } from '@mui/material'
import EmailCodeLogin from '../components/EmailCodeLogin'
import EmptyState from '../components/EmptyState'
import MyGameCard from '../components/MyGameCard'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { useMyGames } from '../hooks/useGame'
import { signOut } from '../lib/auth'

export default function MePage() {
  const { user, loading, isConfigured } = useAuth()
  const { games, loading: gamesLoading, error: gamesError } = useMyGames()

  if (!isConfigured) {
    return (
      <div className="page">
        <PageHeader title="Me" subtitle="Your games and scores." />
        <EmptyState
          title="Offline mode"
          description="Add Supabase env vars to enable sign-in and saved scores."
            action={<PrimaryActionButton to="/" label="Browse games" />}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <PageLoading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <PageHeader
          title="Sign in"
          subtitle="Use your email to save scores and manage games you've created."
        />
        <EmailCodeLogin />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Me" subtitle="Your account and games." />

      <SectionCard title="Account">
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {user.email}
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => void signOut()}
            sx={{ alignSelf: 'flex-start', mt: 0.5 }}
          >
            Sign out
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard
        title="My games"
        subtitle="Games you've published"
        noPadding
      >
        {gamesLoading ? (
          <PageLoading />
        ) : gamesError ? (
          <Typography variant="body2" color="error" sx={{ px: 2, pb: 2 }}>
            {gamesError}
          </Typography>
        ) : games.length === 0 ? (
          <EmptyState
            title="No games yet"
            description="Create a game and it will show up here for you to manage."
            action={<PrimaryActionButton to="/create" label="Create a game" />}
          />
        ) : (
          <Stack spacing={1} sx={{ px: 1.5, pb: 1.5, pt: 0.25 }}>
            {games.map((game) => (
              <MyGameCard key={game.id} game={game} />
            ))}
          </Stack>
        )}
      </SectionCard>
    </div>
  )
}
