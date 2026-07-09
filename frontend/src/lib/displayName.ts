const STORAGE_KEY = 'www_display_name'

const ADJECTIVES = [
  'Clever',
  'Lucky',
  'Brave',
  'Chill',
  'Swift',
  'Witty',
  'Cozy',
  'Nimble',
  'Sunny',
  'Curious',
  'Smooth',
]

const NOUNS = [
  'Otter',
  'Fox',
  'Bear',
  'Panda',
  'Tiger',
  'Koala',
  'Eagle',
  'Whale',
  'Raccoon',
  'Corgi',
  'Owl',
]

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomName() {
  const adjective = ADJECTIVES[randInt(0, ADJECTIVES.length - 1)]
  const noun = NOUNS[randInt(0, NOUNS.length - 1)]
  const suffix = randInt(10, 99)
  return `${adjective}${noun}${suffix}`
}

/**
 * Guest display name — persisted in localStorage for anonymous play on this device.
 */
export function getOrCreateDisplayName(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing && existing.trim().length > 0) return existing
  const generated = generateRandomName()
  localStorage.setItem(STORAGE_KEY, generated)
  return generated
}

