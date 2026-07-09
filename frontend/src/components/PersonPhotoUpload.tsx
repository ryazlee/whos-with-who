import { Box, Button, IconButton, Typography } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useRef, useState } from 'react'
import { fileToDataUrl } from '../lib/fileImage'
import FaceBlurEditor from './FaceBlurEditor'

type Props = {
  value?: string | null
  onChange: (dataUrl: string | null) => void
  required?: boolean
}

export default function PersonPhotoUpload({ value, onChange, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [blurOpen, setBlurOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Pick an image file')
      return
    }

    setError(null)
    try {
      const dataUrl = await fileToDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError('Could not load image')
    }
  }

  return (
    <Box sx={{ flexShrink: 0, width: 72 }}>
      {value ? (
        <Box>
          <Box sx={{ position: 'relative', width: 64, height: 64 }}>
            <Box
              component="img"
              src={value}
              alt=""
              onClick={() => inputRef.current?.click()}
              sx={{
                width: 64,
                height: 64,
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
              }}
            />
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              aria-label="Remove photo"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 28,
                height: 28,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CloseOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Button
            size="small"
            variant="text"
            onClick={() => setBlurOpen(true)}
            sx={{ mt: 0.35, px: 0, minWidth: 0, fontSize: '0.75rem', fontWeight: 500 }}
          >
            Blur faces
          </Button>
        </Box>
      ) : (
        <IconButton
          onClick={() => inputRef.current?.click()}
          aria-label="Add photo"
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: required ? 'error.light' : 'divider',
          }}
        >
          <PhotoCameraOutlinedIcon />
        </IconButton>
      )}

      {error ? (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem' }}>
          {error}
        </Typography>
      ) : null}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => void handleFilePick(e)} />

      {value && blurOpen ? (
        <FaceBlurEditor
          dataUrl={value}
          open={blurOpen}
          onClose={() => setBlurOpen(false)}
          onComplete={({ dataUrl }) => {
            onChange(dataUrl)
            setBlurOpen(false)
          }}
        />
      ) : null}
    </Box>
  )
}
