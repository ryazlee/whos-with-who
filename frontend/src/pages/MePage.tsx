import { Box, Button, Typography } from '@mui/material'
import EmailCodeLogin from '../components/EmailCodeLogin'
import EmptyState from '../components/EmptyState'
import MyGameCard from '../components/MyGameCard'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import PlayedGameCard from '../components/PlayedGameCard'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { useMyGames, usePlayedGames } from '../hooks/useGame'
import { signOut } from '../lib/auth'

export default function MePage() {
  const { user, loading: authLoading, isConfigured } = useAuth()
  const { playedGames, loading: playedLoading, error: playedError } = usePlayedGames()
  const { games, loading: gamesLoading, error: gamesError } = useMyGames()

  if (authLoading) {
    return (
      <div className="page">
        <PageLoading />
      </div>
    )
  }

  return (
    <div className="page mePage">
      <PageHeader
        title="Me"
        subtitle={
          user
            ? 'Your account, scores, and games.'
            : 'Games you’ve played on this device — no sign-in required.'
        }
      />

      {isConfigured && user ? (
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
      ) : null}

      <SectionCard title="Games you've played" subtitle="Saved on this device" noPadding>
        {playedLoading ? (
          <Box sx={{ px: 2, py: 2 }}>
            <PageLoading />
          </Box>
        ) : playedError ? (
          <Typography variant="body2" color="error" sx={{ px: 2, py: 1.5 }}>
            {playedError}
          </Typography>
        ) : playedGames.length === 0 ? (
          <EmptyState
            title="No games played yet"
            description="Finish a game and your score will show up here."
            action={<PrimaryActionButton to="/" label="Browse games" />}
          />
        ) : (
          <Box className="meGameList">
            {playedGames.map(({ ref, summary }, index) => (
              <Box key={ref.attemptId}>
                {index > 0 ? <Box className="meGameList__divider" role="separator" /> : null}
                <PlayedGameCard attempt={ref} game={summary} />
              </Box>
            ))}
          </Box>
        )}
      </SectionCard>

      {isConfigured && !user ? (
        <SectionCard title="Sign in" subtitle="Optional — sync scores across devices">
          <EmailCodeLogin />
        </SectionCard>
      ) : null}

      {isConfigured && user ? (
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
      ) : null}

      {!isConfigured ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
          Offline mode — played games are stored in this browser only.
        </Typography>
      ) : null}
    </div>
  )
}
