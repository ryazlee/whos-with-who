import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function hasAuthHash(): boolean {
  const hash = window.location.hash
  return hash.includes('access_token=') || hash.includes('error=')
}

/** Completes magic-link sign-in when Supabase redirects back with a URL hash. */
export default function AuthRedirectHandler() {
  useEffect(() => {
    if (!supabase || !hasAuthHash()) return

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      }
    })

    void supabase.auth.getSession()

    return () => listener.subscription.unsubscribe()
  }, [])

  return null
}
