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
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
          MATCHING MODE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {MATCHING_MODES.map((mode) => (
            <Chip
              key={mode}
              label={MATCHING_MODE_LABELS[mode]}
              size="small"
              color={ownerMatchingMode === mode ? 'primary' : 'default'}
              variant={ownerMatchingMode === mode ? 'filled' : 'outlined'}
              onClick={() => setOwnerMatchingMode(mode)}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          ))}
          <Chip
            label={modeLocked ? 'Locked for players' : 'Players can switch'}
            size="small"
            variant="outlined"
            color={modeLocked ? 'primary' : 'default'}
            onClick={() => setModeLocked((v) => !v)}
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        </Box>
        <Box sx={{ mt: 1 }}>
          <MatchingModeChip mode={ownerMatchingMode} variant={modeLocked ? 'filled' : 'outlined'} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          PEOPLE · PHOTO REQUIRED
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
