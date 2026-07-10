import type { Person } from '../game/types'

export function buildPersonById(people: Person[]): Map<string, Person> {
  return new Map(people.map((person) => [person.id, person]))
}

export function buildPersonNameById(people: Person[]): Map<string, string> {
  return new Map(people.map((person) => [person.id, person.name]))
}
