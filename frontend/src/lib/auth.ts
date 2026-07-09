import type { Session } from '@supabase/supabase-js'
import { getAuthRedirectUrl } from './authRedirect'
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

/**
 * Sends a magic-link email (required on Supabase free tier with default email).
 *
 * Dashboard → Authentication → URL Configuration:
 * - Site URL: https://ryazlee.github.io/whos-with-who/
 * - Redirect URLs: http://localhost:5173/** and https://ryazlee.github.io/whos-with-who/**
 */
export async function sendSignInLink(email: string) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const trimmed = email.trim().toLowerCase()
  if (!trimmed.includes('@')) throw new Error('Enter a valid email.')

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: getAuthRedirectUrl(),
    },
  })
  if (error) throw error
  return trimmed
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
