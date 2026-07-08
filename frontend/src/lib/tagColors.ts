/** Pastel fills for tag chips — keeps the feed feeling playful, not corporate. */
const TAG_COLORS = [
  { bg: '#FFE8A3', text: '#7A5A00' },
  { bg: '#FFD4C4', text: '#8B3A28' },
  { bg: '#C8F0D4', text: '#1F6B3A' },
  { bg: '#D4E4FF', text: '#2A4F8F' },
  { bg: '#F0D4FF', text: '#5E2F8F' },
] as const

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function tagChipColors(tag: string) {
  return TAG_COLORS[hash(tag) % TAG_COLORS.length]
}
