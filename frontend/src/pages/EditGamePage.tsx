import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  GameEditorAnswerKeySection,
  GameEditorDetailsSection,
  GameEditorPeopleSection,
} from '../components/GameEditorSections'
import GameAuthorLine from '../components/GameAuthorLine'
import EmptyState from '../components/EmptyState'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import PageLoading from '../components/PageLoading'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/AuthContext'
import { useGameEditorDraft } from '../hooks/useGameEditorDraft'
import {
  useDeleteGame,
  useGameForEdit,
  useGameSummary,
  useMyGames,
  useUpdateGame,
} from '../hooks/useGame'
import { absoluteGameUrl, gameStatsPath } from '../lib/gameUrl'

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { game: summary, loading: summaryLoading, error: summaryError } = useGameSummary(id ?? '')
  const { game: editData, loading: editLoading, error: editError } = useGameForEdit(id ?? '')
  const { games: myGames, loading: myGamesLoading } = useMyGames()
  const updateMutation = useUpdateGame()
  const deleteMutation = useDeleteGame()

  const draft = useGameEditorDraft()
  const { loadDraft } = draft

  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState(false)
  const saveFeedbackTimeoutRef = useRef<number | null>(null)

  const ownedGame = useMemo(
    () => myGames.find((game) => game.id === id),
    [myGames, id],
  )

  useEffect(() => {
    if (!editData || initialized) return
    loadDraft(editData)
    setInitialized(true)
  }, [editData, initialized, loadDraft])

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

  const isOwner = Boolean(ownedGame)
  const shareUrl = id ? absoluteGameUrl(id) : ''

  if (!id) {
    return (
      <Page>
        <EmptyState title="Game not found" description="Missing game id." />
      </Page>
    )
  }

  if (authLoading || summaryLoading || myGamesLoading || (isOwner && editLoading)) {
    return (
      <Page>
        <PageLoading />
      </Page>
    )
  }

  if (!user) {
    return (
      <Page>
        <PageHeader title="Game settings" subtitle="Sign in to manage this game." />
        <EmptyState
          title="Sign in required"
          description="Only the game creator can change settings."
          action={<PrimaryActionButton to="/me" label="Sign in" />}
        />
      </Page>
    )
  }

  if (summaryError || !summary) {
    return (
      <Page>
        <EmptyState
          title="Game not found"
          description={summaryError ?? 'This game may have been deleted.'}
          action={<PrimaryActionButton to="/me" label="My games" />}
        />
      </Page>
    )
  }

  if (!isOwner) {
    return (
      <Page>
        <PageHeader title={summary.title} subtitle="Game settings" />
        <EmptyState
          title="Not your game"
          description="Only the creator can edit this game."
          action={<PrimaryActionButton to={`/game/${id}`} label="Back to game" />}
        />
      </Page>
    )
  }

  if (editError || !editData) {
    return (
      <Page>
        <EmptyState
          title="Could not load game"
          description={editError ?? 'Try again later.'}
          action={<PrimaryActionButton to="/me" label="My games" />}
        />
      </Page>
    )
  }

  async function saveChanges() {
    clearSaveFeedback()
    await updateMutation.mutateAsync({
      gameRef: id!,
      title: draft.title,
      description: draft.description,
      tags: draft.tags,
      visibility: draft.visibility,
      ownerMatchingMode: draft.ownerMatchingMode,
      modeLocked: draft.modeLocked,
      allowedMatchingModes: draft.allowedMatchingModes,
      people: draft.people,
      relationships: draft.relationships,
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
    if (!draft.formReady) return 'Fill in all fields to save'
    if (updateMutation.isPending) return 'Saving…'
    return 'Save changes'
  }

  return (
    <Page>
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

      <GameEditorDetailsSection
        title={draft.title}
        onTitleChange={draft.setTitle}
        description={draft.description}
        onDescriptionChange={draft.setDescription}
        tags={draft.tags}
        onTagsChange={draft.setTags}
        visibility={draft.visibility}
        onVisibilityChange={draft.setVisibility}
        ownerMatchingMode={draft.ownerMatchingMode}
        onOwnerMatchingModeChange={draft.setOwnerMatchingMode}
        modeLocked={draft.modeLocked}
        onModeLockedChange={draft.setModeLocked}
        allowedMatchingModes={draft.allowedMatchingModes}
        onAllowedMatchingModesChange={draft.setAllowedMatchingModes}
        disabled={updateMutation.isPending}
      />

      <GameEditorPeopleSection
        people={draft.people}
        onUpdatePerson={draft.updatePerson}
        onAddPerson={draft.addPerson}
        onRemovePerson={draft.removePerson}
      />

      <GameEditorAnswerKeySection
        people={draft.people}
        relationships={draft.relationships}
        onRelationshipsChange={draft.setRelationships}
      />

      <PrimaryActionButton
        disabled={!draft.formReady || updateMutation.isPending}
        onClick={() => void saveChanges()}
        label={saveButtonLabel()}
        color={saveFeedback ? 'success' : 'primary'}
        startIcon={saveFeedback ? <CheckCircleOutlinedIcon /> : undefined}
      />

      <PrimaryActionButton
        to={gameStatsPath(id!)}
        label="View game stats"
        variant="outlined"
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
          {draft.visibility === 'unlisted'
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
    </Page>
  )
}
