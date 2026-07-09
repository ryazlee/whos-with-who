import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CreatorMatchingModeSettings from '../components/CreatorMatchingModeSettings'
import EmailCodeLogin from '../components/EmailCodeLogin'
import GameVisibilityPicker from '../components/GameVisibilityPicker'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import TagInput from '../components/TagInput'
import SectionCard from '../components/SectionCard'
import PersonPhotoUpload from '../components/PersonPhotoUpload'
import RelationshipEditor, {
  type DraftPerson,
  type DraftRelationships,
  hasSingles,
  relationshipsComplete,
  syncRelationshipsForPeople,
} from '../components/RelationshipEditor'
import { useAuth } from '../contexts/AuthContext'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODES } from '../game/matchingModes'
import { queryKeys } from '../hooks/queryKeys'
import { getSupabaseSetupMessage } from '../lib/supabaseConfig'
import PrimaryActionButton from '../components/PrimaryActionButton'
import { publishGame } from '../services/publishGame'
import { isSupabaseEnabled } from '../services/gameService'

function makePersonId() {
  return crypto.randomUUID()
}

export default function CreateGamePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public')
  const [ownerMatchingMode, setOwnerMatchingMode] = useState<MatchingMode>('tap_pairs')
  const [modeLocked, setModeLocked] = useState(false)
  const [allowedMatchingModes, setAllowedMatchingModes] = useState<MatchingMode[]>([...MATCHING_MODES])
  const [people, setPeople] = useState<DraftPerson[]>([
    { id: makePersonId(), name: '', photoDataUrl: null },
    { id: makePersonId(), name: '', photoDataUrl: null },
  ])
  const [relationships, setRelationships] = useState<DraftRelationships>({})

  useEffect(() => {
    setRelationships((prev) => syncRelationshipsForPeople(people, prev))
  }, [people])

  function updatePerson(id: string, patch: Partial<DraftPerson>) {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addPerson() {
    setPeople((prev) => [...prev, { id: makePersonId(), name: '', photoDataUrl: null }])
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

  const formReady = useMemo(() => {
    if (!title.trim()) return false
    if (people.length < 2) return false
    if (!people.every((p) => p.name.trim() && p.photoDataUrl)) return false
    return relationshipsReady
  }, [title, people, relationshipsReady])

  const canPublish = formReady && Boolean(user) && isSupabaseEnabled

  const publishMutation = useMutation({
    mutationFn: () =>
      publishGame({
        title,
        description,
        tags,
        visibility,
        ownerMatchingMode,
        modeLocked,
        allowedMatchingModes,
        people,
        relationships,
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      navigate(`/game/${result.slug}/play`)
    },
  })

  function publishButtonLabel() {
    if (!isSupabaseEnabled) return 'Supabase required to publish'
    if (!user) return 'Sign in to publish'
    if (!formReady) return 'Fill in all fields to publish'
    if (publishMutation.isPending) return 'Publishing…'
    return 'Publish game'
  }

  if (!isSupabaseEnabled) {
    return (
      <div className="page">
        <PageHeader title="Create" subtitle="Add photos, names, and who is actually with who." />
        <Alert severity="warning">{getSupabaseSetupMessage()}</Alert>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="page">
        <PageLoading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <PageHeader
          title="Sign in to create"
          subtitle="An account is required to publish games."
        />
        <EmailCodeLogin />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Create"
        subtitle="Add photos, names, and who is actually with who."
      />

      {user?.email ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: -0.5, lineHeight: 1.5 }}>
          Publishing as <strong>{user.email}</strong>
        </Typography>
      ) : null}

      {publishMutation.error ? (
        <Alert severity="error">
          {publishMutation.error instanceof Error
            ? publishMutation.error.message
            : 'Could not publish game.'}
        </Alert>
      ) : null}

      <SectionCard title="Details">
        <Stack spacing={2}>
          <TextField
            label="Game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="Friend group reunion"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            placeholder="What's this game about? Give players a little context."
          />

          <Box>
            <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
              Tags
            </Typography>
            <TagInput value={tags} onChange={setTags} />
          </Box>

          <GameVisibilityPicker value={visibility} onChange={setVisibility} />

          <CreatorMatchingModeSettings
            modeLocked={modeLocked}
            onModeLockedChange={setModeLocked}
            lockedMode={ownerMatchingMode}
            onLockedModeChange={setOwnerMatchingMode}
            allowedModes={allowedMatchingModes}
            onAllowedModesChange={setAllowedMatchingModes}
          />
        </Stack>
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
                flexDirection: 'column',
                gap: 1.25,
                alignItems: 'stretch',
                px: 2,
                py: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <PersonPhotoUpload
                  value={person.photoDataUrl}
                  onChange={(photoDataUrl) => updatePerson(person.id, { photoDataUrl })}
                  required
                />
                <Typography variant="caption" color="text.secondary">
                  Person {index + 1}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
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

      <PrimaryActionButton
        disabled={!canPublish || publishMutation.isPending}
        onClick={() => publishMutation.mutate()}
        label={publishButtonLabel()}
      />
    </div>
  )
}
