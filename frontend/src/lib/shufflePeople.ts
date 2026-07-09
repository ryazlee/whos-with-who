import type { Person } from '../game/types'

const PLAY_ORDER_KEY = 'www_play_people_order'

function shuffleCopy<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function peopleFingerprint(people: Person[]): string {
  return people
    .map((p) => p.id)
    .sort()
    .join(',')
}

function orderByIds(people: Person[], order: string[]): Person[] {
  const byId = new Map(people.map((p) => [p.id, p]))
  return order.map((id) => byId.get(id)).filter((p): p is Person => p != null)
}

/** Randomize people once per play session; keep stable while playing. */
export function orderPeopleForPlay(
  gameId: string,
  people: Person[],
  isReview: boolean,
  reviewPeople?: Person[],
): Person[] {
  if (isReview && reviewPeople && reviewPeople.length > 0) {
    return reviewPeople
  }

  if (people.length <= 1) return people

  const fingerprint = peopleFingerprint(people)
  const storageKey = `${PLAY_ORDER_KEY}:${gameId}`

  try {
    const raw = sessionStorage.getItem(storageKey)
    if (raw) {
      const stored = JSON.parse(raw) as { fingerprint: string; order: string[] }
      if (stored.fingerprint === fingerprint) {
        const ordered = orderByIds(people, stored.order)
        if (ordered.length === people.length) return ordered
      }
    }
  } catch {
    // ignore corrupt storage
  }

  const shuffled = shuffleCopy(people)
  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ fingerprint, order: shuffled.map((p) => p.id) }),
    )
  } catch {
    // ignore quota errors
  }

  return shuffled
}
