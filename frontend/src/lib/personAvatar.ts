/** Local mock portraits for demo people (served from /public). */
export function mockPersonImage(slug: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}mock/people/${slug}.jpg`
}

/** Offline-friendly placeholder avatar (initials on warm background). */
export function avatarDataUrl(name: string, hue = 18): string {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="24" fill="hsl(${hue} 35% 88%)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="system-ui,sans-serif" font-size="52" font-weight="600" fill="hsl(${hue} 30% 38%)">${initial}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
