import type { MatchingMode } from './matchingModes'
import type { MatchAllCorrectness } from './types'
import { mockPersonImage } from '../lib/personAvatar'

export type CommunityGuess = {
  personId: string
  selectedPartnerId: string | null
}

export type MockGameDefinition = {
  id: string
  title: string
  description: string
  tags: string[]
  visibility: 'public' | 'unlisted'
  attemptCount: number
  ownerMatchingMode: MatchingMode
  modeLocked: boolean
  allowedMatchingModes?: MatchingMode[]
  authorName?: string | null
  publishedAt?: string | null
  people: Array<{ id: string; name: string; imageUrl: string }>
  correctness: MatchAllCorrectness[]
  communityAttempts: CommunityGuess[]
}

function person(id: string, name: string, slug: string) {
  return { id, name, imageUrl: mockPersonImage(slug) }
}

export const MOCK_GAMES: MockGameDefinition[] = [
  {
    id: 'demo',
    title: 'Friend Group Classics',
    description: 'Who’s together? Who’s flying solo? Your group, your guesses.',
    tags: ['friend_group', 'singles_mixed', 'quick_round'],
    visibility: 'public',
    attemptCount: 128,
    authorName: 'Rylee',
    publishedAt: '2026-03-04T12:00:00.000Z',
    ownerMatchingMode: 'tap_pairs',
    modeLocked: false,
    allowedMatchingModes: ['tap_pairs', 'match_all', 'draw_lines'],
    people: [
      person('a', 'Alex', 'alex'),
      person('b', 'Brooke', 'brooke'),
      person('c', 'Casey', 'casey'),
      person('d', 'Dev', 'dev'),
    ],
    correctness: [
      { personId: 'a', correctPartnerId: 'b' },
      { personId: 'b', correctPartnerId: 'a' },
      { personId: 'c', correctPartnerId: null },
      { personId: 'd', correctPartnerId: null },
    ],
    communityAttempts: [
      { personId: 'a', selectedPartnerId: 'b' },
      { personId: 'a', selectedPartnerId: 'b' },
      { personId: 'a', selectedPartnerId: 'b' },
      { personId: 'a', selectedPartnerId: null },
      { personId: 'b', selectedPartnerId: 'a' },
      { personId: 'b', selectedPartnerId: 'a' },
    ],
  },
  {
    id: 'college',
    title: 'College Reunion',
    description: 'Eight people, four pairs — like nothing ever changed.',
    tags: ['reunion', 'long_round'],
    visibility: 'public',
    attemptCount: 84,
    authorName: 'College Crew',
    publishedAt: '2026-02-18T12:00:00.000Z',
    ownerMatchingMode: 'match_all',
    modeLocked: true,
    people: [
      person('m1', 'Mia', 'mia'),
      person('m2', 'Noah', 'noah'),
      person('m3', 'Priya', 'priya'),
      person('m4', 'Sam', 'sam'),
      person('m5', 'Jordan', 'jordan'),
      person('m6', 'Riley', 'riley'),
      person('m7', 'Taylor', 'taylor'),
      person('m8', 'Quinn', 'quinn'),
    ],
    correctness: [
      { personId: 'm1', correctPartnerId: 'm2' },
      { personId: 'm2', correctPartnerId: 'm1' },
      { personId: 'm3', correctPartnerId: 'm4' },
      { personId: 'm4', correctPartnerId: 'm3' },
      { personId: 'm5', correctPartnerId: 'm6' },
      { personId: 'm6', correctPartnerId: 'm5' },
      { personId: 'm7', correctPartnerId: 'm8' },
      { personId: 'm8', correctPartnerId: 'm7' },
    ],
    communityAttempts: [
      { personId: 'm1', selectedPartnerId: 'm2' },
      { personId: 'm3', selectedPartnerId: 'm4' },
      { personId: 'm5', selectedPartnerId: 'm6' },
    ],
  },
  {
    id: 'office',
    title: 'Office Party',
    description: 'Small crew after hours. Two couples walked in — who?',
    tags: ['work_friends', 'quick_round'],
    visibility: 'unlisted',
    attemptCount: 23,
    authorName: 'Office Admin',
    publishedAt: '2026-06-22T12:00:00.000Z',
    ownerMatchingMode: 'tap_pairs',
    modeLocked: true,
    people: [
      person('o1', 'Chris', 'chris'),
      person('o2', 'Dana', 'dana'),
      person('o3', 'Eli', 'eli'),
      person('o4', 'Faye', 'faye'),
    ],
    correctness: [
      { personId: 'o1', correctPartnerId: 'o4' },
      { personId: 'o2', correctPartnerId: 'o3' },
      { personId: 'o3', correctPartnerId: 'o2' },
      { personId: 'o4', correctPartnerId: 'o1' },
    ],
    communityAttempts: [
      { personId: 'o1', selectedPartnerId: 'o4' },
      { personId: 'o2', selectedPartnerId: 'o3' },
    ],
  },
]

export const DAILY_CHALLENGE_GAME_ID = 'demo'

export function getMockGame(gameId: string): MockGameDefinition | undefined {
  return MOCK_GAMES.find((g) => g.id === gameId)
}
