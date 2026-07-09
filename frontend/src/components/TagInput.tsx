import { Box, Chip, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { TAG_LIMITS, addTag, removeTag, tagLabel } from '../lib/tagUtils'

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export default function TagInput({
  value,
  onChange,
  disabled,
  placeholder = 'Type a tag and press Enter',
}: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function commitDraft(raw?: string) {
    const input = (raw ?? draft).trim()
    if (!input) return

    const next = addTag(value, input)
    if (next.length === value.length) {
      if (value.length >= TAG_LIMITS.maxTags) {
        setError(`Up to ${TAG_LIMITS.maxTags} tags.`)
      } else {
        setError('Use at least 2 letters or numbers.')
      }
      return
    }

    onChange(next)
    setDraft('')
    setError(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: value.length ? 1 : 0 }}>
        {value.map((slug) => (
          <Chip
            key={slug}
            label={tagLabel(slug)}
            size="small"
            onDelete={disabled ? undefined : () => onChange(removeTag(value, slug))}
            sx={{ height: 28, fontSize: '0.78rem' }}
          />
        ))}
      </Box>
      <TextField
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          if (error) setError(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commitDraft()
          }
          if (e.key === 'Backspace' && !draft && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => commitDraft()}
        disabled={disabled || value.length >= TAG_LIMITS.maxTags}
        placeholder={value.length >= TAG_LIMITS.maxTags ? 'Tag limit reached' : placeholder}
        fullWidth
        size="small"
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, lineHeight: 1.45 }}>
        Examples: friend group, college reunion, singles mixed
      </Typography>
      {error ? (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  )
}
