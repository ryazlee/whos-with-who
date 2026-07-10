import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODES } from '../game/matchingModes'
import {
  type DraftPerson,
  type DraftRelationships,
  relationshipsComplete,
  syncRelationshipsForPeople,
} from '../components/RelationshipEditor'

function makePersonId() {
  return crypto.randomUUID()
}

function defaultPeople(): DraftPerson[] {
  return [
    { id: makePersonId(), name: '', photoDataUrl: null },
    { id: makePersonId(), name: '', photoDataUrl: null },
  ]
}

export function useGameEditorDraft(initial?: {
  title?: string
  description?: string
  tags?: string[]
  visibility?: 'public' | 'unlisted'
  ownerMatchingMode?: MatchingMode
  modeLocked?: boolean
  allowedMatchingModes?: MatchingMode[]
  people?: DraftPerson[]
  relationships?: DraftRelationships
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>(initial?.visibility ?? 'public')
  const [ownerMatchingMode, setOwnerMatchingMode] = useState<MatchingMode>(
    initial?.ownerMatchingMode ?? 'tap_pairs',
  )
  const [modeLocked, setModeLocked] = useState(initial?.modeLocked ?? false)
  const [allowedMatchingModes, setAllowedMatchingModes] = useState<MatchingMode[]>(
    initial?.allowedMatchingModes ?? [...MATCHING_MODES],
  )
  const [people, setPeople] = useState<DraftPerson[]>(initial?.people ?? defaultPeople())
  const [relationships, setRelationships] = useState<DraftRelationships>(initial?.relationships ?? {})

  useEffect(() => {
    setRelationships((prev) => syncRelationshipsForPeople(people, prev))
  }, [people])

  function updatePerson(id: string, patch: Partial<DraftPerson>) {
    setPeople((prev) => prev.map((person) => (person.id === id ? { ...person, ...patch } : person)))
  }

  const addPerson = useCallback(() => {
    setPeople((prev) => [...prev, { id: makePersonId(), name: '', photoDataUrl: null }])
  }, [])

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => {
      if (prev.length <= 2) return prev
      const next = prev.filter((person) => person.id !== id)
      setRelationships((rel) => syncRelationshipsForPeople(next, rel))
      return next
    })
  }, [])

  const loadDraft = useCallback((draft: {
    title: string
    description: string
    tags: string[]
    visibility: 'public' | 'unlisted'
    ownerMatchingMode: MatchingMode
    modeLocked: boolean
    allowedMatchingModes: MatchingMode[]
    people: DraftPerson[]
    relationships: DraftRelationships
  }) => {
    setTitle(draft.title)
    setDescription(draft.description)
    setTags(draft.tags)
    setVisibility(draft.visibility)
    setOwnerMatchingMode(draft.ownerMatchingMode)
    setModeLocked(draft.modeLocked)
    setAllowedMatchingModes(draft.allowedMatchingModes)
    setPeople(draft.people)
    setRelationships(draft.relationships)
  }, [])

  const relationshipsReady = relationshipsComplete(people, relationships)

  const formReady = useMemo(() => {
    if (!title.trim()) return false
    if (people.length < 2) return false
    if (!people.every((person) => person.name.trim() && person.photoDataUrl)) return false
    return relationshipsReady
  }, [title, people, relationshipsReady])

  return {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    visibility,
    setVisibility,
    ownerMatchingMode,
    setOwnerMatchingMode,
    modeLocked,
    setModeLocked,
    allowedMatchingModes,
    setAllowedMatchingModes,
    people,
    relationships,
    setRelationships,
    updatePerson,
    addPerson,
    removePerson,
    loadDraft,
    formReady,
    relationshipsReady,
  }
}
