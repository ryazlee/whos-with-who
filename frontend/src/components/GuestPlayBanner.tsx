import { useState } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import EmailCodeLogin from './EmailCodeLogin'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseEnabled } from '../services/gameService'

/** Optional sign-in upsell after a guest finishes a game — never shown during play. */
export default function GuestPlayBanner() {
  const { user, loading, isConfigured } = useAuth()
  const [expanded, setExpanded] = useState(false)

  if (!isConfigured || !isSupabaseEnabled || loading || user) {
    return null
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        Score saved on this device.
      </Typography>

      {expanded ? (
        <Box sx={{ mt: 1.25 }}>
          <EmailCodeLogin />
          <Button
            type="button"
            size="small"
            color="inherit"
            onClick={() => setExpanded(false)}
            sx={{ mt: 0.5, color: 'text.secondary' }}
          >
            Not now
          </Button>
        </Box>
      ) : (
        <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, alignItems: 'center' }}>
          <Button type="button" size="small" variant="outlined" onClick={() => setExpanded(true)}>
            Sign in to save
          </Button>
          <Link component={RouterLink} to="/me" variant="caption" color="text.secondary" underline="hover">
            Later
          </Link>
        </Stack>
      )}
    </Box>
  )
}
