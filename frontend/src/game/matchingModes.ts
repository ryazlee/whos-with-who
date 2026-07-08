export type MatchingMode = 'match_all' | 'tap_pairs'

export const MATCHING_MODE_LABELS: Record<MatchingMode, string> = {
  match_all: 'List',
  tap_pairs: 'Tap pairs',
}

export const MATCHING_MODES: MatchingMode[] = ['tap_pairs', 'match_all']
