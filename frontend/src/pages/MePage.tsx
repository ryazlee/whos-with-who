import { Box, Button, Typography } from '@mui/material'
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
    <div className="page mePage">
      <PageHeader title="Me" subtitle="Your account and games." />

      <Box className="surfaceCard meAccount">
        <Typography className="meAccount__email" component="p">
          {user.email}
        </Typography>
        <Button
          variant="text"
          size="small"
          color="inherit"
          onClick={() => void signOut()}
          className="meAccount__signOut"
        >
          Sign out
        </Button>
      </Box>

      <SectionCard title="My games" subtitle="Games you've published" noPadding>
        {gamesLoading ? (
          <Box sx={{ px: 2, py: 2 }}>
            <PageLoading />
          </Box>
        ) : gamesError ? (
          <Typography variant="body2" color="error" sx={{ px: 2, py: 1.5 }}>
            {gamesError}
          </Typography>
        ) : games.length === 0 ? (
          <EmptyState
            title="No games yet"
            description="Create a game and it will show up here for you to manage."
            action={<PrimaryActionButton to="/create" label="Create a game" />}
          />
        ) : (
          <Box className="meGameList">
            {games.map((game, index) => (
              <Box key={game.id}>
                {index > 0 ? <Box className="meGameList__divider" role="separator" /> : null}
                <MyGameCard game={game} />
              </Box>
            ))}
          </Box>
        )}
      </SectionCard>
    </div>
  )
}
