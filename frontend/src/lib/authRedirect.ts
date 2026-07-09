/** Where Supabase should send users after they click the email sign-in link. */
export function getAuthRedirectUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  if (typeof window !== 'undefined') {
    const url = new URL(base, window.location.origin)
    return url.href.endsWith('/') ? url.href : `${url.href}/`
  }
  return 'https://ryazlee.github.io/whos-with-who/'
}
