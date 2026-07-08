import { Chip } from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS } from '../game/matchingModes'

type Props = {
  mode: MatchingMode
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
}

export default function MatchingModeChip({ mode, size = 'small', variant = 'outlined' }: Props) {
  return (
    <Chip
      label={MATCHING_MODE_LABELS[mode]}
      size={size}
      variant={variant}
      color={variant === 'filled' ? 'primary' : 'default'}
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? 10.5 : 12,
        borderRadius: 999,
        height: size === 'small' ? 22 : 26,
        bgcolor: variant === 'outlined' ? 'action.hover' : undefined,
        border: 'none',
        flexShrink: 0,
      }}
    />
  )
}
