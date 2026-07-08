import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SectionCard from './SectionCard'
import { sendEmailCode, verifyEmailCode } from '../lib/auth'

type Props = {
  compact?: boolean
  onSuccess?: () => void
}

export default function EmailCodeLogin({ compact, onSuccess }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const normalized = await sendEmailCode(email)
      setEmail(normalized)
      setStep('code')
      setInfo('Check your inbox for a 6-digit code.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyEmailCode(email, code)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.')
    } finally {
      setBusy(false)
    }
  }

  const body = (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {info ? <Alert severity="info">{info}</Alert> : null}

      {step === 'email' ? (
        <Box component="form" onSubmit={(e) => void handleSendCode(e)}>
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
              {busy ? 'Sending…' : 'Send sign-in code'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box component="form" onSubmit={(e) => void handleVerify(e)}>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Code sent to <strong>{email}</strong>
            </Typography>
            <TextField
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              fullWidth
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={busy || code.length < 6} sx={{ py: 1.2 }}>
              {busy ? 'Verifying…' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="text"
              color="inherit"
              disabled={busy}
              onClick={() => {
                setStep('email')
                setCode('')
                setError(null)
                setInfo(null)
              }}
              sx={{ color: 'text.secondary' }}
            >
              Use a different email
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  )

  if (compact) {
    return body
  }

  return (
    <SectionCard title="Sign in" subtitle="We'll email you a one-time code — no password.">
      {body}
    </SectionCard>
  )
}
