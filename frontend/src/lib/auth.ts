import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export function isAuthConfigured(): boolean {
  return Boolean(supabase)
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/** Requires an email-verified session (used before submitting scores). */
export async function ensureSession(): Promise<Session> {
  if (!supabase) {
    throw new Error('Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session) {
    throw new Error('Sign in with your email to continue.')
  }
  return data.session
}

export async function sendEmailCode(email: string) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const trimmed = email.trim().toLowerCase()
  if (!trimmed.includes('@')) throw new Error('Enter a valid email.')

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: { shouldCreateUser: true },
  })
  if (error) throw error
  return trimmed
}

export async function verifyEmailCode(email: string, code: string) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const token = code.trim().replace(/\s/g, '')
  if (token.length < 6) throw new Error('Enter the 6-digit code from your email.')

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: 'email',
  })
  if (error) throw error
  return data.session
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
