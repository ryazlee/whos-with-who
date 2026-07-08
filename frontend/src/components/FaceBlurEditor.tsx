import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { BlurRegion } from '../lib/imageBlur'
import {
  applyAllBlurRegions,
  computeImageLayout,
  drawImageToCanvas,
  loadImageFromFile,
  pointerToCanvasCoords,
} from '../lib/imageBlur'

const MAX_W = 360
const MAX_H = 480
const DEFAULT_BRUSH = 44

type Props = {
  file: File
  open: boolean
  onClose: () => void
  onComplete: (result: { dataUrl: string; blob: Blob }) => void
}

export default function FaceBlurEditor({ file, open, onClose, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const layoutRef = useRef<{ width: number; height: number; scale: number } | null>(null)

  const [regions, setRegions] = useState<BlurRegion[]>([])
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const redraw = useCallback((nextRegions: BlurRegion[]) => {
    const canvas = canvasRef.current
    const image = imageRef.current
    const layout = layoutRef.current
    if (!canvas || !image || !layout) return

    if (!workCanvasRef.current) {
      workCanvasRef.current = document.createElement('canvas')
    }
    const work = workCanvasRef.current
    applyAllBlurRegions(work, image, layout, nextRegions)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(work, 0, 0)
  }, [])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setRegions([])

    void loadImageFromFile(file)
      .then((image) => {
        if (cancelled) return
        imageRef.current = image
        const layout = computeImageLayout(image.naturalWidth, image.naturalHeight, MAX_W, MAX_H)
        layoutRef.current = layout

        const canvas = canvasRef.current
        if (!canvas) return
        drawImageToCanvas(canvas, image, layout)
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
  }, [file, open])

  function addBlurAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas || loading) return

    const { x, y } = pointerToCanvasCoords(canvas, clientX, clientY)
    const region: BlurRegion = { x, y, radius: brushSize / 2 }
    setRegions((prev) => {
      const next = [...prev, region]
      redraw(next)
      return next
    })
  }

  function handlePointer(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    addBlurAt(e.clientX, e.clientY)
  }

  function handleUndo() {
    setRegions((prev) => {
      const next = prev.slice(0, -1)
      const image = imageRef.current
      const layout = layoutRef.current
      const canvas = canvasRef.current
      if (!image || !layout || !canvas) return next

      if (next.length === 0) {
        drawImageToCanvas(canvas, image, layout)
      } else {
        redraw(next)
      }
      return next
    })
  }

  function handleClear() {
    const image = imageRef.current
    const layout = layoutRef.current
    const canvas = canvasRef.current
    if (image && layout && canvas) {
      drawImageToCanvas(canvas, image, layout)
    }
    setRegions([])
  }

  async function handleDone() {
    const canvas = canvasRef.current
    if (!canvas) return

    setSaving(true)
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Export failed'))),
          'image/jpeg',
          0.92,
        )
      })
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      onComplete({ dataUrl, blob })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save image')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen sx={{ '& .MuiDialog-paper': { bgcolor: 'background.default' } }}>
      <DialogTitle sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}>
        Blur faces
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 0 }}>
        {error ? (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 280,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              …
            </Typography>
          ) : (
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointer}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                cursor: 'crosshair',
              }}
            />
          )}
        </Box>

        <Stack spacing={0.5} sx={{ mt: 2 }}>
          <Slider
            value={brushSize}
            min={28}
            max={80}
            step={4}
            onChange={(_, v) => setBrushSize(v as number)}
            color="primary"
            size="small"
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <IconButton onClick={handleUndo} disabled={regions.length === 0} color="primary" aria-label="Undo blur">
            <UndoOutlinedIcon />
          </IconButton>
          <Button size="small" onClick={handleClear} disabled={regions.length === 0}>
            Clear
          </Button>
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
          {saving ? '…' : 'Done'}
        </Button>
        <Button fullWidth onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
