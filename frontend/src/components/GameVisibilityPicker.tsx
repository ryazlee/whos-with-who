import { Box, Chip, Typography } from '@mui/material'
import type { GameSummary } from '../datastore/types'

type Visibility = GameSummary['visibility']

type Props = {
  value: Visibility
  onChange: (value: Visibility) => void
  disabled?: boolean
}

const pillSx = (active: boolean) => ({
  height: 32,
  fontSize: '0.82rem',
  fontWeight: 500,
  borderRadius: '99px',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? 'primary.main' : 'transparent',
  color: active ? 'primary.contrastText' : 'text.secondary',
  opacity: 1,
})

export default function GameVisibilityPicker({ value, onChange, disabled }: Props) {
  return (
    <Box>
      <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
        Who can find this game
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <Chip
          label="Public"
          size="small"
          disabled={disabled}
          onClick={() => onChange('public')}
          sx={pillSx(value === 'public')}
        />
        <Chip
          label="Unlisted"
          size="small"
          disabled={disabled}
          onClick={() => onChange('unlisted')}
          sx={pillSx(value === 'unlisted')}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.45 }}>
        {value === 'public'
          ? 'Shows on Home and Browse for anyone to discover.'
          : 'Hidden from discovery — only people with the link can play.'}
      </Typography>
    </Box>
  )
}
