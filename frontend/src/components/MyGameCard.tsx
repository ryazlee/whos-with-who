import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import type { GameSummary } from '../datastore/types'
import { useDeleteGame, useUpdateGameVisibility } from '../hooks/useGame'
import { absoluteGameUrl, gamePlayPath } from '../lib/gameUrl'
import GameCardContent from './GameCardContent'
import PrimaryActionButton from './PrimaryActionButton'

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
      <Box className="surfaceCard gameCard gameCard--manage">
        <GameCardContent game={game} tagLimit={4} avatarSize={40} avatarMax={3} />

        <Stack spacing={0.75} className="gameCard__actions">
          <PrimaryActionButton to={gamePlayPath(game.id)} label="Play" sx={{ py: 1.05 }} />
          <Button
            component={RouterLink}
            to={`/game/${game.id}/edit`}
            variant="text"
            fullWidth
            size="small"
            startIcon={<SettingsOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{ color: 'text.secondary', py: 0.75 }}
          >
            Settings
          </Button>
        </Stack>

        <Box className="gameCard__manageSection">
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            Visibility
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
            <Chip
              label="Public"
              size="small"
              onClick={() => void setVisibility('public')}
              disabled={visibilityMutation.isPending}
              color={isPublic ? 'primary' : 'default'}
              variant={isPublic ? 'filled' : 'outlined'}
              sx={{ height: 28, borderRadius: '8px' }}
            />
            <Chip
              label="Unlisted"
              size="small"
              onClick={() => void setVisibility('unlisted')}
              disabled={visibilityMutation.isPending}
              color={!isPublic ? 'primary' : 'default'}
              variant={!isPublic ? 'filled' : 'outlined'}
              sx={{ height: 28, borderRadius: '8px' }}
            />
          </Box>

          {visibilityMutation.error ? (
            <Alert severity="error" sx={{ mb: 1, py: 0.25 }}>
              {visibilityMutation.error instanceof Error
                ? visibilityMutation.error.message
                : 'Could not update visibility.'}
            </Alert>
          ) : null}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ wordBreak: 'break-all', lineHeight: 1.4, display: 'block', mb: 0.75 }}
          >
            {shareUrl}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<ContentCopyOutlinedIcon />}
            onClick={() => void copyLink()}
            sx={{ borderRadius: '10px', mb: 0.75 }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>

          <Button
            fullWidth
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => setDeleteOpen(true)}
            sx={{ py: 0.5 }}
          >
            Delete game
          </Button>
        </Box>
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
