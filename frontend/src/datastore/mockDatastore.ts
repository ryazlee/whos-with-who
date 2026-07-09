import { computeMatchAllScore } from '../game/matchAllScoring'
import {
  getCompletedAttemptForGame,
  getLocalAttemptResult,
  saveAttemptResult,
} from '../lib/localAttempts'
import {
  DAILY_CHALLENGE_GAME_ID,
  getMockGame,
  MOCK_GAMES,
  type MockGameDefinition,
} from '../game/mockGames'
import type { MatchAllCorrectness } from '../game/types'
import type {
  AttemptResult,
  CommunityPerPerson,
  DailyChallenge,
  GameForPlay,
  GameSummary,
  ID,
  MatchAllSelections,
} from './types'
import type { WhoWithWhoDatastore } from './WhoWithWhoDatastore'
import { MATCHING_MODES } from '../game/matchingModes'

function toSummary(game: MockGameDefinition): GameSummary {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    tags: game.tags,
    visibility: game.visibility,
    attemptCount: game.attemptCount,
    peopleCount: game.people.length,
    ownerMatchingMode: game.ownerMatchingMode,
    modeLocked: game.modeLocked,
    allowedMatchingModes: game.allowedMatchingModes ?? [...MATCHING_MODES],
    authorName: game.authorName ?? null,
    publishedAt: game.publishedAt ?? null,
    previewPeople: game.people.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
    })),
  }
}

function computeCommunityPerPerson(args: {
  people: MockGameDefinition['people']
  attempts: Array<{ personId: ID; selectedPartnerId: ID | null }>
}): CommunityPerPerson {
  const attemptsByPerson = new Map<ID, Array<{ selectedPartnerId: ID | null }>>()
  for (const a of args.attempts) {
    const cur = attemptsByPerson.get(a.personId) ?? []
    cur.push({ selectedPartnerId: a.selectedPartnerId })
    attemptsByPerson.set(a.personId, cur)
  }

  return args.people.map((p) => {
    const personAttempts = attemptsByPerson.get(p.id) ?? []
    const total = personAttempts.length || 1

    const counts = new Map<ID | null, number>()
    for (const a of personAttempts) {
      counts.set(a.selectedPartnerId, (counts.get(a.selectedPartnerId) ?? 0) + 1)
    }

    let topPartnerId: ID | null = null
    let topCount = -1
    for (const [partnerId, count] of counts.entries()) {
      if (count > topCount) {
        topCount = count
        topPartnerId = partnerId
      }
    }

    const topPercent = Math.round((topCount / total) * 100)
    const singleCount = counts.get(null) ?? 0
    const singlePercent = Math.round((singleCount / total) * 100)

    return {
      personId: p.id,
      topPartnerId,
      topPercent,
      singlePercent,
    }
  })
}

function makeAttemptId(): ID {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID() as ID
  return `attempt_${Math.random().toString(16).slice(2)}`
}

function gameForPlayFromDefinition(game: MockGameDefinition): GameForPlay {
  const singleCount = game.correctness.filter(
    (c: MatchAllCorrectness) => c.correctPartnerId === null,
  ).length
  const allowSingleChoice = singleCount > 0
  return {
    gameId: game.id,
    title: game.title,
    authorName: game.authorName ?? null,
    ownerMatchingMode: game.ownerMatchingMode,
    modeLocked: game.modeLocked,
    allowedMatchingModes: game.allowedMatchingModes ?? [...MATCHING_MODES],
    people: game.people,
    allowSingleChoice,
    singleCount,
  }
}

class MockWhoWithWhoDatastore implements WhoWithWhoDatastore {
  private attemptsById = new Map<ID, AttemptResult>()

  async listPopularGames(): Promise<GameSummary[]> {
    return MOCK_GAMES.filter((g) => g.visibility === 'public')
      .map(toSummary)
      .sort((a, b) => b.attemptCount - a.attemptCount)
  }

  async getDailyChallenge(): Promise<DailyChallenge> {
    const game = getMockGame(DAILY_CHALLENGE_GAME_ID) ?? MOCK_GAMES[0]
    return {
      date: new Date().toISOString().slice(0, 10),
      game: toSummary(game),
    }
  }

  async getGameSummary(gameId: ID): Promise<GameSummary> {
    const game = getMockGame(gameId)
    if (!game) throw new Error('Game not found')
    return toSummary(game)
  }

  async getGameForPlay(gameId: ID): Promise<GameForPlay> {
    const game = getMockGame(gameId)
    if (!game) throw new Error('Game not found')
    return gameForPlayFromDefinition(game)
  }

  async submitMatchAllAttempt(args: {
    gameId: ID
    selections: MatchAllSelections
    displayNameSnapshot: string
  }): Promise<AttemptResult> {
    const game = getMockGame(args.gameId)
    if (!game) throw new Error('Game not found')

    if (getCompletedAttemptForGame(args.gameId)) {
      throw new Error('You already played this game')
    }

    const score = computeMatchAllScore({
      correctness: game.correctness,
      selections: args.selections,
    })

    const attemptId = makeAttemptId()

    const myAttemptRows = game.people.map((p) => ({
      personId: p.id as ID,
      selectedPartnerId: args.selections[p.id] ?? null,
    }))

    const communityPerPerson = computeCommunityPerPerson({
      people: game.people,
      attempts: [...game.communityAttempts, ...myAttemptRows],
    })

    const result: AttemptResult = {
      attemptId,
      gameId: game.id,
      people: game.people,
      displayNameSnapshot: args.displayNameSnapshot,
      score100: score.score100,
      correctCount: score.correctCount,
      totalQuestions: score.totalQuestions,
      perPerson: score.perPerson,
      communityPerPerson,
    }

    this.attemptsById.set(attemptId, result)
    saveAttemptResult(result)
    return result
  }

  async getMyAttemptForGame(gameId: ID): Promise<AttemptResult | null> {
    const ref = getCompletedAttemptForGame(gameId)
    if (!ref) return null
    try {
      return await this.getAttemptResult(ref.attemptId)
    } catch {
      return null
    }
  }

  async getAttemptResult(attemptId: ID): Promise<AttemptResult> {
    const res = this.attemptsById.get(attemptId)
    if (res) return res

    const local = getLocalAttemptResult(attemptId)
    if (local) {
      this.attemptsById.set(attemptId, local)
      return local
    }

    throw new Error('Attempt not found')
  }
}

export const mockDatastore: WhoWithWhoDatastore = new MockWhoWithWhoDatastore()
