import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import EmailCodeLogin from '../components/EmailCodeLogin'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../lib/auth'
import PageLoading from '../components/PageLoading'

export default function MePage() {
  const { user, loading, isConfigured } = useAuth()

  if (!isConfigured) {
    return (
      <div className="page">
        <PageHeader title="Me" subtitle="Your games and scores." />
        <EmptyState
          title="Offline mode"
          description="Add Supabase env vars to enable sign-in and saved scores."
          action={
            <Button component={RouterLink} to="/" variant="outlined">
              Browse games
            </Button>
          }
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
          subtitle="Use your email to save scores and track games you've played."
        />
        <EmailCodeLogin />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Me" subtitle="Signed in and ready to play." />

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

      <EmptyState
        title="Your history"
        description="Played games and created games will show up here soon."
        action={
          <Button component={RouterLink} to="/" variant="contained">
            Play a game
          </Button>
        }
      />
    </div>
  )
}
