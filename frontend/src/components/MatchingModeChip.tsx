import { Chip } from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS } from '../game/matchingModes'

type Props = {
  mode: MatchingMode
  size?: 'small' | 'medium'
}

export default function MatchingModeChip({ mode, size = 'small' }: Props) {
  return (
    <Chip
      label={MATCHING_MODE_LABELS[mode]}
      size={size}
      variant="outlined"
      sx={{
        height: size === 'small' ? 22 : 26,
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        fontWeight: 500,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  )
}
