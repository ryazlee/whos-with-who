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
  Stack,
  Tooltip,
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
        <GameCardContent game={game} tagLimit={3} avatarSize={36} avatarMax={3} />

        <Stack spacing={0.75} className="gameCard__manageToolbar">
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to={gamePlayPath(game.id)}
              variant="contained"
              size="small"
              sx={{ minWidth: 64, px: 1.5, py: 0.5, fontWeight: 600 }}
            >
              Play
            </Button>
            <Button
              component={RouterLink}
              to={`/game/${game.id}/edit`}
              variant="outlined"
              size="small"
              startIcon={<SettingsOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{ px: 1.25, py: 0.5 }}
            >
              Settings
            </Button>
            <Box sx={{ flex: 1, minWidth: 8 }} />
            <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
              <IconButton size="small" onClick={() => void copyLink()} aria-label="Copy link">
                <ContentCopyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete game">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete game"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.25 }}>
              Visibility
            </Typography>
            <Chip
              label="Public"
              size="small"
              onClick={() => void setVisibility('public')}
              disabled={visibilityMutation.isPending}
              color={isPublic ? 'primary' : 'default'}
              variant={isPublic ? 'filled' : 'outlined'}
              sx={{ height: 24, fontSize: '0.7rem', borderRadius: '6px' }}
            />
            <Chip
              label="Unlisted"
              size="small"
              onClick={() => void setVisibility('unlisted')}
              disabled={visibilityMutation.isPending}
              color={!isPublic ? 'primary' : 'default'}
              variant={!isPublic ? 'filled' : 'outlined'}
              sx={{ height: 24, fontSize: '0.7rem', borderRadius: '6px' }}
            />
          </Stack>

          {visibilityMutation.error ? (
            <Alert severity="error" sx={{ py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
              {visibilityMutation.error instanceof Error
                ? visibilityMutation.error.message
                : 'Could not update visibility.'}
            </Alert>
          ) : null}
        </Stack>
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
