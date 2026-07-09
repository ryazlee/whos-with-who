import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CROP_VIEWPORT_SIZE,
  clampCropTransform,
  cropImageToDataUrl,
  initialCropTransform,
  loadImageFromDataUrl,
  minCoverScale,
  type CropTransform,
} from '../lib/imageCrop'

type Props = {
  dataUrl: string
  open: boolean
  onClose: () => void
  onComplete: (result: { dataUrl: string }) => void
}

export default function ImageCropEditor({ dataUrl, open, onClose, onComplete }: Props) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null,
  )

  const [transform, setTransform] = useState<CropTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [minScale, setMinScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const applyTransform = useCallback((next: CropTransform) => {
    const image = imageRef.current
    if (!image) {
      setTransform(next)
      return
    }
    setTransform(clampCropTransform(next, image.naturalWidth, image.naturalHeight))
  }, [])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)

    void loadImageFromDataUrl(dataUrl)
      .then((image) => {
        if (cancelled) return
        imageRef.current = image
        const coverScale = minCoverScale(image.naturalWidth, image.naturalHeight, CROP_VIEWPORT_SIZE)
        setMinScale(coverScale)
        setTransform(initialCropTransform(image.naturalWidth, image.naturalHeight))
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load image')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dataUrl, open])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (loading) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current
    if (!start) return
    applyTransform({
      ...transform,
      offsetX: start.offsetX + (e.clientX - start.x),
      offsetY: start.offsetY + (e.clientY - start.y),
    })
  }

  function handlePointerUp() {
    dragStartRef.current = null
  }

  function handleScaleChange(_: Event, value: number | number[]) {
    const image = imageRef.current
    if (!image) return
    const scale = value as number
    const centerX = CROP_VIEWPORT_SIZE / 2
    const centerY = CROP_VIEWPORT_SIZE / 2
    const ratio = scale / transform.scale
    applyTransform({
      scale,
      offsetX: centerX - (centerX - transform.offsetX) * ratio,
      offsetY: centerY - (centerY - transform.offsetY) * ratio,
    })
  }

  async function handleDone() {
    const image = imageRef.current
    if (!image) return

    setSaving(true)
    try {
      const cropped = cropImageToDataUrl(image, transform)
      onComplete({ dataUrl: cropped })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save image')
    } finally {
      setSaving(false)
    }
  }

  const image = imageRef.current

  return (
    <Dialog open={open} onClose={onClose} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'background.default' } }}>
      <DialogTitle sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}>
        Crop photo
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 0 }}>
        {error ? (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        <Box
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            position: 'relative',
            width: CROP_VIEWPORT_SIZE,
            maxWidth: '100%',
            height: CROP_VIEWPORT_SIZE,
            mx: 'auto',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: loading ? 'default' : 'grab',
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                …
              </Typography>
            </Box>
          ) : image ? (
            <Box
              component="img"
              src={dataUrl}
              alt=""
              draggable={false}
              sx={{
                position: 'absolute',
                left: transform.offsetX,
                top: transform.offsetY,
                width: image.naturalWidth * transform.scale,
                height: image.naturalHeight * transform.scale,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          ) : null}

          {!loading ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.35)',
              }}
            />
          ) : null}
        </Box>

        <Stack spacing={0.5} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Drag to reposition · zoom to adjust
          </Typography>
          <Slider
            value={transform.scale}
            min={minScale}
            max={minScale * 3}
            step={0.01}
            onChange={handleScaleChange}
            color="primary"
            size="small"
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || saving}
          onClick={() => void handleDone()}
          sx={{ borderRadius: 2, py: 1.25 }}
        >
          {saving ? '…' : 'Apply crop'}
        </Button>
        <Button fullWidth onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
