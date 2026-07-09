/** Turn snake_case / kebab-case tags into readable labels. */
export function formatTag(tag: string): string {
  return tag
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatAttemptCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(n)
}

export function formatPostedDate(isoDate: string | null | undefined): string | null {
  return formatDateShort(isoDate)
}

/** Short locale date for compact meta lines (no "Posted" prefix). */
export function formatDateShort(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
