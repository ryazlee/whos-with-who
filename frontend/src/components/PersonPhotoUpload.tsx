import { Box, IconButton } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useRef, useState } from 'react'
import FaceBlurEditor from './FaceBlurEditor'

type Props = {
  value?: string | null
  onChange: (dataUrl: string | null) => void
  required?: boolean
}

export default function PersonPhotoUpload({ value, onChange, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file?.type.startsWith('image/')) return
    setPendingFile(file)
    setEditorOpen(true)
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      {value ? (
        <Box sx={{ position: 'relative', width: 56, height: 56 }}>
          <Box
            component="img"
            src={value}
            alt=""
            onClick={() => inputRef.current?.click()}
            sx={{
              width: 56,
              height: 56,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
            }}
          />
          <IconButton
            size="small"
            onClick={() => onChange(null)}
            aria-label="Remove"
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 22,
              height: 22,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ) : (
        <IconButton
          onClick={() => inputRef.current?.click()}
          aria-label="Add photo"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: required ? 'error.light' : 'divider',
          }}
        >
          <PhotoCameraOutlinedIcon fontSize="small" color="primary" />
        </IconButton>
      )}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFilePick} />

      {pendingFile ? (
        <FaceBlurEditor
          file={pendingFile}
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false)
            setPendingFile(null)
          }}
          onComplete={({ dataUrl }) => {
            onChange(dataUrl)
            setPendingFile(null)
            setEditorOpen(false)
          }}
        />
      ) : null}
    </Box>
  )
}
