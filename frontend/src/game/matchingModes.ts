export type MatchingMode = 'match_all' | 'tap_pairs' | 'draw_lines'

export const MATCHING_MODE_LABELS: Record<MatchingMode, string> = {
  tap_pairs: 'Tap pairs',
  match_all: 'List',
  draw_lines: 'Draw lines',
}

export const MATCHING_MODE_DESCRIPTIONS: Record<MatchingMode, string> = {
  tap_pairs: 'Tap one person, then tap their partner.',
  match_all: 'Go down the list and pick each person’s partner.',
  draw_lines: 'Drag lines between people on a circle map.',
}

export const MATCHING_MODES: MatchingMode[] = ['tap_pairs', 'match_all', 'draw_lines']

export function normalizeAllowedModes(modes: MatchingMode[] | undefined | null): MatchingMode[] {
  if (!modes?.length) return [...MATCHING_MODES]
  const valid = modes.filter((m): m is MatchingMode => MATCHING_MODES.includes(m))
  return valid.length > 0 ? valid : [...MATCHING_MODES]
}
