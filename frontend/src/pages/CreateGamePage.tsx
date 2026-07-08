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
import { useMemo, useState } from 'react'
import MatchingModeChip from '../components/MatchingModeChip'
import PersonPhotoUpload from '../components/PersonPhotoUpload'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS, MATCHING_MODES } from '../game/matchingModes'

type DraftPerson = {
  id: string
  name: string
  photoDataUrl: string | null
}

function makeId() {
  return `person_${Math.random().toString(36).slice(2, 9)}`
}

export default function CreateGamePage() {
  const [title, setTitle] = useState('')
  const [ownerMatchingMode, setOwnerMatchingMode] = useState<MatchingMode>('tap_pairs')
  const [modeLocked, setModeLocked] = useState(false)
  const [people, setPeople] = useState<DraftPerson[]>([
    { id: makeId(), name: '', photoDataUrl: null },
  ])

  function updatePerson(id: string, patch: Partial<DraftPerson>) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addPerson() {
    setPeople((prev) => [...prev, { id: makeId(), name: '', photoDataUrl: null }])
  }

  function removePerson(id: string) {
    setPeople((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)))
  }

  const canPublish = useMemo(() => {
    if (!title.trim()) return false
    if (people.length < 2) return false
    return people.every((p) => p.name.trim() && p.photoDataUrl)
  }, [title, people])

  return (
    <div className="page">
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
              disabled={people.length <= 1}
              sx={{ mt: 0.5 }}
              aria-label="Remove"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!canPublish}
        sx={{ borderRadius: 2, py: 1.5 }}
      >
        Publish
      </Button>
    </div>
  )
}
