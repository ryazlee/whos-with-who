import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useEffect, useMemo, useState } from 'react'
import MatchingModeChip from '../components/MatchingModeChip'
import PersonPhotoUpload from '../components/PersonPhotoUpload'
import RelationshipEditor, {
  type DraftPerson,
  type DraftRelationships,
  hasSingles,
  relationshipsComplete,
  syncRelationshipsForPeople,
} from '../components/RelationshipEditor'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS, MATCHING_MODES } from '../game/matchingModes'

function makeId() {
  return `person_${Math.random().toString(36).slice(2, 9)}`
}

export default function CreateGamePage() {
  const [title, setTitle] = useState('')
  const [ownerMatchingMode, setOwnerMatchingMode] = useState<MatchingMode>('tap_pairs')
  const [modeLocked, setModeLocked] = useState(false)
  const [people, setPeople] = useState<DraftPerson[]>([
    { id: makeId(), name: '', photoDataUrl: null },
    { id: makeId(), name: '', photoDataUrl: null },
  ])
  const [relationships, setRelationships] = useState<DraftRelationships>({})

  useEffect(() => {
    setRelationships((prev) => syncRelationshipsForPeople(people, prev))
  }, [people])

  function updatePerson(id: string, patch: Partial<DraftPerson>) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addPerson() {
    setPeople((prev) => [...prev, { id: makeId(), name: '', photoDataUrl: null }])
  }

  function removePerson(id: string) {
    setPeople((prev) => {
      if (prev.length <= 2) return prev
      const next = prev.filter((p) => p.id !== id)
      setRelationships((rel) => syncRelationshipsForPeople(next, rel))
      return next
    })
  }

  const relationshipsReady = relationshipsComplete(people, relationships)

  const canPublish = useMemo(() => {
    if (!title.trim()) return false
    if (people.length < 2) return false
    if (!people.every((p) => p.name.trim() && p.photoDataUrl)) return false
    return relationshipsReady
  }, [title, people, relationshipsReady])

  return (
    <div className="page">
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          Create game
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add photos, names, and the real couples.
        </Typography>
      </Box>

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        size="small"
        placeholder="Friend group"
      />

      <Box>
        <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
          Matching mode
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35 }}>
          {MATCHING_MODES.map((mode) => {
            const active = ownerMatchingMode === mode
            return (
              <Chip
                key={mode}
                label={MATCHING_MODE_LABELS[mode]}
                size="small"
                onClick={() => setOwnerMatchingMode(mode)}
                sx={{
                  height: 28,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  borderRadius: '99px',
                  border: '1px solid',
                  borderColor: active ? 'primary.main' : 'divider',
                  bgcolor: active ? 'primary.main' : 'background.paper',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                }}
              />
            )
          })}
          <Chip
            label={modeLocked ? 'Locked' : 'Unlocked'}
            size="small"
            onClick={() => setModeLocked((v) => !v)}
            sx={{
              height: 28,
              fontSize: '0.8rem',
              fontWeight: 500,
              borderRadius: '99px',
              border: '1px solid',
              borderColor: modeLocked ? 'primary.main' : 'divider',
              bgcolor: modeLocked ? 'primary.main' : 'background.paper',
              color: modeLocked ? 'primary.contrastText' : 'text.secondary',
            }}
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <MatchingModeChip mode={ownerMatchingMode} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography className="section-label" component="p">
          People
        </Typography>
        <IconButton size="small" onClick={addPerson} aria-label="Add person">
          <AddOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stack spacing={2}>
        {people.map((person) => (
          <Box key={person.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <PersonPhotoUpload
              value={person.photoDataUrl}
              onChange={(photoDataUrl) => updatePerson(person.id, { photoDataUrl })}
              required
            />
            <TextField
              label="Name"
              value={person.name}
              onChange={(e) => updatePerson(person.id, { name: e.target.value })}
              fullWidth
              size="small"
              required
            />
            <IconButton
              size="small"
              onClick={() => removePerson(person.id)}
              disabled={people.length <= 2}
              sx={{ mt: 0.5 }}
              aria-label="Remove"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Box>
        <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
          Couples (answer key)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Who is actually with who? Pick a partner or Single for each person.
          {hasSingles(relationships) ? ' Singles are allowed in this game.' : null}
        </Typography>
        <RelationshipEditor
          people={people}
          relationships={relationships}
          onChange={setRelationships}
        />
      </Box>

      <Button variant="contained" color="primary" fullWidth disabled={!canPublish}>
        Publish
      </Button>
    </div>
  )
}
