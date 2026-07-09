import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import CreatorMatchingModeSettings from '../components/CreatorMatchingModeSettings'
import GameVisibilityPicker from '../components/GameVisibilityPicker'
import GameAuthorLine from '../components/GameAuthorLine'
import TagInput from '../components/TagInput'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import PersonPhotoUpload from '../components/PersonPhotoUpload'
import PrimaryActionButton from '../components/PrimaryActionButton'
import RelationshipEditor, {
  type DraftPerson,
  type DraftRelationships,
  hasSingles,
  relationshipsComplete,
  syncRelationshipsForPeople,
} from '../components/RelationshipEditor'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODES } from '../game/matchingModes'
import {
  useDeleteGame,
  useGameForEdit,
  useGameSummary,
  useMyGames,
  useUpdateGame,
} from '../hooks/useGame'
import { absoluteGameUrl } from '../lib/gameUrl'

function makePersonId() {
  return crypto.randomUUID()
}

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { game: summary, loading: summaryLoading, error: summaryError } = useGameSummary(id ?? '')
  const { game: editData, loading: editLoading, error: editError } = useGameForEdit(id ?? '')
  const { games: myGames, loading: myGamesLoading } = useMyGames()
  const updateMutation = useUpdateGame()
  const deleteMutation = useDeleteGame()

  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState(false)
  const saveFeedbackTimeoutRef = useRef<number | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public')
  const [ownerMatchingMode, setOwnerMatchingMode] = useState<MatchingMode>('tap_pairs')
  const [modeLocked, setModeLocked] = useState(false)
  const [allowedMatchingModes, setAllowedMatchingModes] = useState<MatchingMode[]>([...MATCHING_MODES])
  const [people, setPeople] = useState<DraftPerson[]>([])
  const [relationships, setRelationships] = useState<DraftRelationships>({})

  const ownedGame = useMemo(
    () => myGames.find((g) => g.id === id),
    [myGames, id],
  )

  useEffect(() => {
    if (!editData || initialized) return
    setTitle(editData.title)
    setDescription(editData.description)
    setTags(editData.tags)
    setVisibility(editData.visibility)
    setOwnerMatchingMode(editData.ownerMatchingMode)
    setModeLocked(editData.modeLocked)
    setAllowedMatchingModes(editData.allowedMatchingModes)
    setPeople(editData.people)
    setRelationships(editData.relationships)
    setInitialized(true)
  }, [editData, initialized])

  useEffect(() => {
    setRelationships((prev) => syncRelationshipsForPeople(people, prev))
  }, [people])

  useEffect(() => {
    return () => {
      if (saveFeedbackTimeoutRef.current != null) {
        window.clearTimeout(saveFeedbackTimeoutRef.current)
      }
    }
  }, [])

  function showSaveFeedback() {
    setSaveFeedback(true)
    if (saveFeedbackTimeoutRef.current != null) {
      window.clearTimeout(saveFeedbackTimeoutRef.current)
    }
    saveFeedbackTimeoutRef.current = window.setTimeout(() => {
      setSaveFeedback(false)
      saveFeedbackTimeoutRef.current = null
    }, 5000)
  }

  function clearSaveFeedback() {
    setSaveFeedback(false)
    if (saveFeedbackTimeoutRef.current != null) {
      window.clearTimeout(saveFeedbackTimeoutRef.current)
      saveFeedbackTimeoutRef.current = null
    }
  }

  function updatePerson(personId: string, patch: Partial<DraftPerson>) {
    setPeople((prev) => prev.map((p) => (p.id === personId ? { ...p, ...patch } : p)))
  }

  function addPerson() {
    setPeople((prev) => [...prev, { id: makePersonId(), name: '', photoDataUrl: null }])
  }

  function removePerson(personId: string) {
    setPeople((prev) => {
      if (prev.length <= 2) return prev
      const next = prev.filter((p) => p.id !== personId)
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

  const isOwner = Boolean(ownedGame)
  const shareUrl = id ? absoluteGameUrl(id) : ''

  if (!id) {
    return (
      <div className="page">
        <EmptyState title="Game not found" description="Missing game id." />
      </div>
    )
  }

  if (authLoading || summaryLoading || myGamesLoading || (isOwner && editLoading)) {
    return (
      <div className="page">
        <PageLoading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <PageHeader title="Game settings" subtitle="Sign in to manage this game." />
        <EmptyState
          title="Sign in required"
          description="Only the game creator can change settings."
          action={<PrimaryActionButton to="/me" label="Sign in" />}
        />
      </div>
    )
  }

  if (summaryError || !summary) {
    return (
      <div className="page">
        <EmptyState
          title="Game not found"
          description={summaryError ?? 'This game may have been deleted.'}
          action={<PrimaryActionButton to="/me" label="My games" />}
        />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="page">
        <PageHeader title={summary.title} subtitle="Game settings" />
        <EmptyState
          title="Not your game"
          description="Only the creator can edit this game."
          action={<PrimaryActionButton to={`/game/${id}`} label="Back to game" />}
        />
      </div>
    )
  }

  if (editError || !editData) {
    return (
      <div className="page">
        <EmptyState
          title="Could not load game"
          description={editError ?? 'Try again later.'}
          action={<PrimaryActionButton to="/me" label="My games" />}
        />
      </div>
    )
  }

  async function saveChanges() {
    clearSaveFeedback()
    await updateMutation.mutateAsync({
      gameRef: id!,
      title,
      description,
      tags,
      visibility,
      ownerMatchingMode,
      modeLocked,
      allowedMatchingModes,
      people,
      relationships,
    })
    showSaveFeedback()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function confirmDelete() {
    await deleteMutation.mutateAsync(id!)
    setDeleteOpen(false)
    navigate('/me')
  }

  function saveButtonLabel() {
    if (saveFeedback) return 'Saved!'
    if (!formReady) return 'Fill in all fields to save'
    if (updateMutation.isPending) return 'Saving…'
    return 'Save changes'
  }

  return (
    <div className="page">
      <PageHeader title="Edit game" subtitle="Update details, people, and the answer key." />

      <SectionCard>
        <GameAuthorLine name={summary.authorName} variant="body2" />
      </SectionCard>

      {updateMutation.error ? (
        <Alert severity="error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : 'Could not save changes.'}
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
            <TagInput value={tags} onChange={setTags} disabled={updateMutation.isPending} />
          </Box>

          <GameVisibilityPicker
            value={visibility}
            onChange={setVisibility}
            disabled={updateMutation.isPending}
          />

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
        disabled={!formReady || updateMutation.isPending}
        onClick={() => void saveChanges()}
        label={saveButtonLabel()}
        color={saveFeedback ? 'success' : 'primary'}
        startIcon={saveFeedback ? <CheckCircleOutlinedIcon /> : undefined}
      />

      {saveFeedback ? (
        <Alert
          severity="success"
          icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
          onClose={clearSaveFeedback}
          sx={{
            border: 1,
            borderColor: 'success.main',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
            Changes saved
          </Typography>
          <Typography variant="body2">
            Your game is updated. Players will see the latest title, people, and answer key.
          </Typography>
        </Alert>
      ) : null}

      <Snackbar
        open={saveFeedback}
        autoHideDuration={5000}
        onClose={clearSaveFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 'calc(var(--bottom-inset) + 0.75rem)', md: 24 } }}
      >
        <Alert
          severity="success"
          variant="filled"
          icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
          onClose={clearSaveFeedback}
          sx={{ width: '100%', alignItems: 'center' }}
        >
          Game saved successfully
        </Alert>
      </Snackbar>

      <SectionCard title="Share link">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, lineHeight: 1.5 }}>
          {visibility === 'unlisted'
            ? 'Anyone with this link can play. The game stays hidden from Home and Browse.'
            : 'Public games also appear on Home and Browse. This link still works for sharing.'}
        </Typography>
        <Stack spacing={0.75}>
          <Chip
            label={shareUrl}
            size="small"
            variant="outlined"
            sx={{ maxWidth: '100%', height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 } }}
          />
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ContentCopyOutlinedIcon />}
            onClick={() => void copyLink()}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </Stack>
      </SectionCard>

      <Stack spacing={0.75}>
        <Button component={RouterLink} to="/me" variant="outlined" fullWidth>
          Back to my games
        </Button>
        <Button
          color="error"
          variant="outlined"
          fullWidth
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete game
        </Button>
      </Stack>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this game?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            “{summary.title}” and all play data will be permanently removed. This cannot be undone.
          </Typography>
          {deleteMutation.error ? (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : 'Could not delete game.'}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void confirmDelete()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
