/** Vite base path without trailing slash, e.g. `/whos-with-who`. Empty for local `/`. */
export const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Canonical home URL with trailing slash, e.g. `/whos-with-who/`. */
export const APP_HOME_HREF = APP_BASE_PATH ? `${APP_BASE_PATH}/` : '/'

export function isAppHomeTarget(to: string): boolean {
  return to === '/' || to === APP_HOME_HREF || to === APP_BASE_PATH
}

/** GitHub Pages project sites should use a trailing slash on the home URL. */
export function ensureHomeTrailingSlash(): void {
  if (typeof window === 'undefined' || !APP_BASE_PATH) return
  if (window.location.pathname === APP_BASE_PATH) {
    window.history.replaceState(null, '', APP_HOME_HREF)
  }
}
