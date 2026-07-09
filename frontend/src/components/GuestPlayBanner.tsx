import type { ReactNode } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import EmailCodeLogin from './EmailCodeLogin'
import SectionCard from './SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { getOrCreateDisplayName } from '../lib/displayName'
import { isSupabaseEnabled } from '../services/gameService'

type Props = {
  /** Shorter copy for play page; fuller on results. */
  variant?: 'play' | 'result'
}

export function guestDisplayLabel(): string {
  return getOrCreateDisplayName()
}

/** Optional sign-in upsell — never blocks play. */
export default function GuestPlayBanner({ variant = 'play' }: Props) {
  const { user, loading, isConfigured } = useAuth()

  if (!isConfigured || !isSupabaseEnabled || loading || user) {
    return null
  }

  const guestName = guestDisplayLabel()

  return (
    <SectionCard
      title={variant === 'result' ? 'Score saved on this device' : `Playing as ${guestName}`}
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 1.25 }}>
        {variant === 'result'
          ? 'Sign in to save this score to your account and pick it up on other devices.'
          : 'Your score will save on this device. Sign in if you want stats to follow your account.'}
      </Typography>
      <EmailCodeLogin compact />
      <Box sx={{ mt: 1 }}>
        <Link component={RouterLink} to="/me" variant="caption" color="text.secondary" underline="hover">
          Or go to Me to sign in later
        </Link>
      </Box>
    </SectionCard>
  )
}

export function GuestPlayHint({ children }: { children?: ReactNode }) {
  const { user, loading, isConfigured } = useAuth()
  if (!isConfigured || loading || user) return null

  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', lineHeight: 1.4 }}>
      {children ?? 'Playing as guest — score saves on this device only.'}
    </Typography>
  )
}
