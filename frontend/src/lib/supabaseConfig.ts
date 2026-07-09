const PLACEHOLDER_KEY = 'YOUR_ANON_PUBLIC_KEY'

function readEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string | undefined {
  const value = import.meta.env[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function getSupabaseEnv() {
  const url = readEnv('VITE_SUPABASE_URL')
  const anonKey = readEnv('VITE_SUPABASE_ANON_KEY')
  const hasPlaceholderKey = anonKey === PLACEHOLDER_KEY

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && !hasPlaceholderKey),
  }
}

export function getSupabaseSetupMessage(): string {
  if (import.meta.env.DEV) {
    return 'Copy frontend/.env.example to frontend/.env.local, add your Supabase URL and anon key, then restart npm run dev.'
  }

  return 'This deployment is missing Supabase env vars. In GitHub → Settings → Secrets and variables → Actions, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.'
}
