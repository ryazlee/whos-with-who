import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './supabaseConfig'

const { url: supabaseUrl, anonKey: supabaseAnonKey, isConfigured } = getSupabaseEnv()

function buildClient(): SupabaseClient | null {
  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = buildClient()

