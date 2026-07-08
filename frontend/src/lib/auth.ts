import { supabase } from './supabaseClient'

/**
 * Ensures the current browser has an anonymous Supabase session.
 * Safe to call on pages/routes that allow anon play.
 */
export async function ensureAnonSession() {
  if (!supabase) {
    throw new Error('Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (data.session) return data.session

  const { data: signInData, error: signInError } =
    await supabase.auth.signInAnonymously()
  if (signInError) throw signInError
  return signInData.session
}

