import type { User } from '@supabase/supabase-js'

export function userDisplayLabel(user: User): string {
  const email = user.email?.trim()
  if (email) return email

  const meta = user.user_metadata?.display_name
  if (typeof meta === 'string' && meta.trim()) return meta.trim()

  return 'Signed in'
}
