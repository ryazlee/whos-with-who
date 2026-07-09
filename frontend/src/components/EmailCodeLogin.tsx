import { useEffect, useState } from 'react'
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

const RESEND_COOLDOWN_SEC = 60

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
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  async function requestCode(targetEmail: string) {
    const normalized = await sendEmailCode(targetEmail)
    setEmail(normalized)
    setStep('code')
    setCode('')
    setResendCooldown(RESEND_COOLDOWN_SEC)
    setInfo(`Enter the 6-digit code sent to ${normalized}.`)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      await requestCode(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || busy) return
    setBusy(true)
    setError(null)
    try {
      await requestCode(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.')
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
              Enter the 6-digit code sent to your email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sent to <strong>{email}</strong>
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
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  pattern: '[0-9]{6}',
                  inputMode: 'numeric',
                  style: { letterSpacing: '0.25em', fontVariantNumeric: 'tabular-nums' },
                },
              }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={busy || code.length < 6} sx={{ py: 1.2 }}>
              {busy ? 'Verifying…' : 'Sign in'}
            </Button>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
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
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  )

  if (compact) {
    return body
  }

  return (
    <SectionCard title="Sign in" subtitle="We'll email you a 6-digit code — no password.">
      {body}
    </SectionCard>
  )
}
