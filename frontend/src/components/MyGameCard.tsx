import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { useDeleteGame, useUpdateGameVisibility } from '../hooks/useGame'
import { absoluteGameUrl, gamePlayPath } from '../lib/gameUrl'
import GameCardContent from './GameCardContent'

type Props = {
  game: GameSummary
  onDeleted?: () => void
}

export default function MyGameCard({ game, onDeleted }: Props) {
  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const visibilityMutation = useUpdateGameVisibility()
  const deleteMutation = useDeleteGame()

  const shareUrl = absoluteGameUrl(game.id)
  const isPublic = game.visibility === 'public'

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function setVisibility(visibility: 'public' | 'unlisted') {
    if (visibility === game.visibility || visibilityMutation.isPending) return
    await visibilityMutation.mutateAsync({ gameRef: game.id, visibility })
  }

  async function confirmDelete() {
    await deleteMutation.mutateAsync(game.id)
    setDeleteOpen(false)
    onDeleted?.()
  }

  return (
    <>
      <Box className="meGameRow">
        <GameCardContent
          game={game}
          layout="inline"
          tagLimit={3}
          avatarSize={32}
          avatarMax={3}
        />

        <Box className="meGameRow__footer">
          <Box className="meVisibility" role="group" aria-label="Visibility">
            <button
              type="button"
              className="meVisibility__option"
              aria-pressed={isPublic}
              disabled={visibilityMutation.isPending}
              onClick={() => void setVisibility('public')}
            >
              Public
            </button>
            <button
              type="button"
              className="meVisibility__option"
              aria-pressed={!isPublic}
              disabled={visibilityMutation.isPending}
              onClick={() => void setVisibility('unlisted')}
            >
              Unlisted
            </button>
          </Box>

          <Box className="meGameRow__actions" component="nav" aria-label="Game actions">
            <RouterLink className="meGameRow__action meGameRow__action--primary" to={gamePlayPath(game.id)}>
              Play
            </RouterLink>
            <span className="meGameRow__sep" aria-hidden>
              ·
            </span>
            <RouterLink className="meGameRow__action" to={`/game/${game.id}/edit`}>
              Edit
            </RouterLink>
            <span className="meGameRow__sep" aria-hidden>
              ·
            </span>
            <button type="button" className="meGameRow__action" onClick={() => void copyLink()}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="meGameRow__sep" aria-hidden>
              ·
            </span>
            <button
              type="button"
              className="meGameRow__action meGameRow__action--danger"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </button>
          </Box>
        </Box>

        {visibilityMutation.error ? (
          <Alert severity="error" sx={{ mt: 0.75, py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
            {visibilityMutation.error instanceof Error
              ? visibilityMutation.error.message
              : 'Could not update visibility.'}
          </Alert>
        ) : null}
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this game?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            “{game.title}” and all play data will be permanently removed. This cannot be undone.
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
    </>
  )
}
