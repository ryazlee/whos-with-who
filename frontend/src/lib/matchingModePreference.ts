import type { MatchingMode } from '../game/matchingModes'

const STORAGE_KEY = 'www_matching_mode'

export function getPreferredMatchingMode(): MatchingMode | null {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'match_all' || v === 'tap_pairs') return v
  return null
}

export function setPreferredMatchingMode(mode: MatchingMode) {
  localStorage.setItem(STORAGE_KEY, mode)
}
