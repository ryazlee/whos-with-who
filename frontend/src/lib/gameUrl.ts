export function gamePath(gameRef: string): string {
  return `/game/${gameRef}`
}

export function gamePlayPath(gameRef: string): string {
  return `/game/${gameRef}/play`
}

export function gameStatsPath(gameRef: string): string {
  return `/game/${gameRef}/stats`
}

export function absoluteGameUrl(gameRef: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = gamePath(gameRef)
  return `${window.location.origin}${base}${path}`
}
