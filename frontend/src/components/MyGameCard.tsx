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
import { formatAttemptCount, formatPostedDate, formatTag } from '../lib/formatters'
import FaceStack, { faceStackWidth } from './FaceStack'
import MatchingModeChip from './MatchingModeChip'
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

  const stackSize = 36
  const stackMax = 3
  const stackWidth = faceStackWidth(stackSize, stackMax)

  const metaItems = [
    game.authorName?.trim() ? `By ${game.authorName.trim()}` : null,
    `${game.peopleCount} people`,
    `${formatAttemptCount(game.attemptCount)} plays`,
    formatPostedDate(game.publishedAt),
  ].filter(Boolean) as string[]

  return (
    <>
      <Box className="surfaceCard gameCardCompact" sx={{ p: 1.25 }}>
        <Box className="gameCardRow">
          <Box className="gameCardCompact__avatar" sx={{ width: stackWidth }}>
            <FaceStack
              people={game.previewPeople}
              totalCount={game.peopleCount}
              size={stackSize}
              max={stackMax}
            />
          </Box>

          <Box className="gameCardCompact__body">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 0.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {game.title}
              </Typography>
              <MatchingModeChip mode={game.ownerMatchingMode} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, display: 'block' }}>
              {metaItems.join(' · ')}
            </Typography>
            {game.description ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.35,
                }}
              >
                {game.description}
              </Typography>
            ) : null}
            {game.tags.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35, mt: 0.15 }}>
                {game.tags.slice(0, 4).map((tag) => (
                  <Chip
                    key={tag}
                    label={formatTag(tag)}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.68rem', '& .MuiChip-label': { px: 0.65 } }}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        </Box>

        <Stack spacing={0.5}>
          <PrimaryActionButton to={gamePlayPath(game.id)} label="Play" sx={{ py: 1 }} />
          <Button
            component={RouterLink}
            to={`/game/${game.id}/edit`}
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<SettingsOutlinedIcon />}
          >
            Settings
          </Button>
        </Stack>

        <Box sx={{ pt: 0.875, borderTop: 1, borderColor: 'divider' }}>
          <Typography className="section-label" component="p" sx={{ mb: 0.5 }}>
            Visibility
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
            <Chip
              label="Public"
              size="small"
              onClick={() => void setVisibility('public')}
              disabled={visibilityMutation.isPending}
              color={isPublic ? 'primary' : 'default'}
              variant={isPublic ? 'filled' : 'outlined'}
            />
            <Chip
              label="Unlisted"
              size="small"
              onClick={() => void setVisibility('unlisted')}
              disabled={visibilityMutation.isPending}
              color={!isPublic ? 'primary' : 'default'}
              variant={!isPublic ? 'filled' : 'outlined'}
            />
          </Box>

          {visibilityMutation.error ? (
            <Alert severity="error" sx={{ mb: 0.75, py: 0.25 }}>
              {visibilityMutation.error instanceof Error
                ? visibilityMutation.error.message
                : 'Could not update visibility.'}
            </Alert>
          ) : null}

          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ wordBreak: 'break-all', lineHeight: 1.35 }}
            >
              {shareUrl}
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={() => void copyLink()}
            >
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </Stack>

          <Box sx={{ mt: 0.75 }}>
            <Button
              fullWidth
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete game
            </Button>
          </Box>
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
