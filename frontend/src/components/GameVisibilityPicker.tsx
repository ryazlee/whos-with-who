import { Box, Chip, Typography } from '@mui/material'
import type { GameSummary } from '../datastore/types'
import { selectionChipSx } from '../lib/selectionChipSx'

type Visibility = GameSummary['visibility']

type Props = {
  value: Visibility
  onChange: (value: Visibility) => void
  disabled?: boolean
}

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
          sx={selectionChipSx(value === 'public', disabled)}
        />
        <Chip
          label="Unlisted"
          size="small"
          disabled={disabled}
          onClick={() => onChange('unlisted')}
          sx={selectionChipSx(value === 'unlisted', disabled)}
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
