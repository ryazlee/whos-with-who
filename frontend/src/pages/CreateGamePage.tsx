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
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import PersonPhotoUpload from '../components/PersonPhotoUpload'
import RelationshipEditor, {
  type DraftPerson,
  type DraftRelationships,
  hasSingles,
  relationshipsComplete,
  syncRelationshipsForPeople,
} from '../components/RelationshipEditor'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS } from '../game/matchingModes'
import MatchingModePicker from '../components/MatchingModePicker'

function makeId() {
  return `person_${Math.random().toString(36).slice(2, 9)}`
}

const pillSx = (active: boolean) => ({
  height: 32,
  fontSize: '0.82rem',
  fontWeight: 500,
  borderRadius: '99px',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? 'primary.main' : 'transparent',
  color: active ? 'primary.contrastText' : 'text.secondary',
})

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
      <PageHeader
        title="Create"
        subtitle="Add photos, names, and who is actually with who."
      />

      <SectionCard title="Details">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1fr 1fr' },
            gap: { md: 2 },
          }}
        >
          <TextField
            label="Game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="Friend group reunion"
            sx={{ mb: { xs: 2, md: 0 }, gridColumn: { md: '1 / -1' } }}
          />

          <Box>
            <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
              How players match
            </Typography>
            <MatchingModePicker value={ownerMatchingMode} onChange={setOwnerMatchingMode} />
            <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                label={modeLocked ? 'Mode locked for players' : 'Players can switch mode'}
                size="small"
                onClick={() => setModeLocked((v) => !v)}
                sx={pillSx(modeLocked)}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {MATCHING_MODE_LABELS[ownerMatchingMode]} — tap photos or pick from a list.
            </Typography>
          </Box>
        </Box>
      </SectionCard>

      <SectionCard
        title="People"
        subtitle="Photo and name required for each person"
        noPadding
      >
        <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          {people.map((person, index) => (
            <Box
              key={person.id}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.25, sm: 1.5 },
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                px: 2,
                py: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonPhotoUpload
                  value={person.photoDataUrl}
                  onChange={(photoDataUrl) => updatePerson(person.id, { photoDataUrl })}
                  required
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
                  Person {index + 1}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'flex-start' }}>
                <TextField
                  label="Name"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                  fullWidth
                  placeholder="Alex"
                  required
                />
                <IconButton
                  onClick={() => removePerson(person.id)}
                  disabled={people.length <= 2}
                  aria-label="Remove person"
                  sx={{ mt: 0.5, flexShrink: 0 }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Button
            startIcon={<AddOutlinedIcon />}
            onClick={addPerson}
            variant="outlined"
            fullWidth
            sx={{ py: 1.1, borderStyle: 'dashed' }}
          >
            Add person
          </Button>
        </Box>
      </SectionCard>

      <SectionCard
        title="Answer key"
        subtitle="The real couples — players try to match these"
      >
        {hasSingles(relationships) ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Singles are allowed in this game.
          </Typography>
        ) : null}
        <RelationshipEditor
          people={people}
          relationships={relationships}
          onChange={setRelationships}
        />
      </SectionCard>

      <Button variant="contained" color="primary" fullWidth size="large" disabled={!canPublish} sx={{ py: 1.35 }}>
        {canPublish ? 'Publish game' : 'Fill in all fields to publish'}
      </Button>
    </div>
  )
}
