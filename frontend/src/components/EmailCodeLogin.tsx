import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { sendSignInLink } from '../lib/auth'
import { getAuthRedirectUrl } from '../lib/authRedirect'

const RESEND_COOLDOWN_SEC = 60

type Props = {
  onSuccess?: () => void
}

export default function EmailCodeLogin({ onSuccess }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (step === 'sent' && user) {
      onSuccess?.()
    }
  }, [step, user, onSuccess])

  async function requestLink(targetEmail: string) {
    const normalized = await sendSignInLink(targetEmail)
    setEmail(normalized)
    setStep('sent')
    setResendCooldown(RESEND_COOLDOWN_SEC)
    setInfo(`Open the sign-in link we sent to ${normalized} on this device.`)
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      await requestLink(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send sign-in link.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || busy) return
    setBusy(true)
    setError(null)
    try {
      await requestLink(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend link.')
    } finally {
      setBusy(false)
    }
  }

  const body = (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {info ? <Alert severity="info">{info}</Alert> : null}

      {step === 'email' ? (
        <Box component="form" onSubmit={(e) => void handleSendLink(e)}>
          <Stack spacing={1.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              fullWidth
              autoComplete="email"
              autoFocus
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ py: 1.2 }}>
              {busy ? 'Sending…' : 'Email sign-in link'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Check your inbox for <strong>{email}</strong> and tap the sign-in link.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            The link returns you to {getAuthRedirectUrl()}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="button"
              variant="text"
              color="inherit"
              disabled={busy}
              onClick={() => {
                setStep('email')
                setError(null)
                setInfo(null)
                setResendCooldown(0)
              }}
              sx={{ color: 'text.secondary' }}
            >
              Use a different email
            </Button>
            <Button
              type="button"
              variant="text"
              disabled={busy || resendCooldown > 0}
              onClick={() => void handleResend()}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend link'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  )

  return body
}
