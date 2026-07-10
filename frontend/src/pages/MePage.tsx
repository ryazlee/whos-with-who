import { Box, Button, Typography } from '@mui/material'
import EmailCodeLogin from '../components/EmailCodeLogin'
import MeGameList, { MeGameListItem } from '../components/MeGameList'
import MyGameCard from '../components/MyGameCard'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import PlayedGameCard from '../components/PlayedGameCard'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import SectionQueryContent from '../components/SectionQueryContent'
import { useAuth } from '../contexts/AuthContext'
import { useMyGames, usePlayedGames } from '../hooks/useGame'
import { signOut } from '../lib/auth'

export default function MePage() {
  const { user, loading: authLoading, isConfigured } = useAuth()
  const { playedGames, loading: playedLoading, error: playedError } = usePlayedGames()
  const { games, loading: gamesLoading, error: gamesError } = useMyGames()

  if (authLoading) {
    return (
      <Page>
        <PageLoading />
      </Page>
    )
  }

  return (
    <Page className="mePage">
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
        <SectionQueryContent
          loading={playedLoading}
          error={playedError}
          isEmpty={playedGames.length === 0}
          emptyTitle="No games played yet"
          emptyDescription="Finish a game and your score will show up here."
          emptyAction={<PrimaryActionButton to="/" label="Browse games" />}
        >
          <MeGameList>
            {playedGames.map(({ ref, summary }, index) => (
              <MeGameListItem key={ref.attemptId} showDivider={index > 0}>
                <PlayedGameCard attempt={ref} game={summary} />
              </MeGameListItem>
            ))}
          </MeGameList>
        </SectionQueryContent>
      </SectionCard>

      {isConfigured && !user ? (
        <SectionCard title="Sign in">
          <EmailCodeLogin />
        </SectionCard>
      ) : null}

      {isConfigured && user ? (
        <SectionCard title="My games" subtitle="Games you've published" noPadding>
          <SectionQueryContent
            loading={gamesLoading}
            error={gamesError}
            isEmpty={games.length === 0}
            emptyTitle="No games yet"
            emptyDescription="Create a game and it will show up here for you to manage."
            emptyAction={<PrimaryActionButton to="/create" label="Create a game" />}
          >
            <MeGameList>
              {games.map((game, index) => (
                <MeGameListItem key={game.id} showDivider={index > 0}>
                  <MyGameCard game={game} />
                </MeGameListItem>
              ))}
            </MeGameList>
          </SectionQueryContent>
        </SectionCard>
      ) : null}

      {!isConfigured ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
          Offline mode — played games are stored in this browser only.
        </Typography>
      ) : null}
    </Page>
  )
}
