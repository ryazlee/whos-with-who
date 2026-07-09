import { formatTag } from './formatters'

const MAX_TAG_SLUG_LEN = 40
const MAX_TAGS = 12

export function slugifyTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, MAX_TAG_SLUG_LEN)
}

export function parseTagInput(raw: string): string | null {
  const slug = slugifyTag(raw)
  if (!slug || slug.length < 2) return null
  return slug
}

export function tagLabel(slug: string): string {
  return formatTag(slug)
}

export function addTag(current: string[], raw: string): string[] {
  const slug = parseTagInput(raw)
  if (!slug) return current
  if (current.includes(slug)) return current
  if (current.length >= MAX_TAGS) return current
  return [...current, slug].sort()
}

export function removeTag(current: string[], slug: string): string[] {
  return current.filter((t) => t !== slug)
}

export function tagsToPayload(slugs: string[]): Array<{ slug: string; label: string }> {
  return slugs.map((slug) => ({ slug, label: tagLabel(slug) }))
}

export const TAG_LIMITS = { maxTags: MAX_TAGS, maxSlugLen: MAX_TAG_SLUG_LEN }
