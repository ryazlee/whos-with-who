import { Box, Chip, Typography } from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS, MATCHING_MODES } from '../game/matchingModes'
import { setPreferredMatchingMode } from '../lib/matchingModePreference'

const pillSx = (active: boolean) => ({
  height: 36,
  fontSize: '0.85rem',
  fontWeight: 500,
  borderRadius: '99px',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? 'primary.main' : 'transparent',
  color: active ? 'primary.contrastText' : 'text.secondary',
  '& .MuiChip-label': { px: 1.25 },
})

type Props = {
  value: MatchingMode
  onChange: (mode: MatchingMode) => void
}

export default function MatchingModePicker({ value, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {MATCHING_MODES.map((mode) => (
        <Chip
          key={mode}
          label={MATCHING_MODE_LABELS[mode]}
          onClick={() => {
            setPreferredMatchingMode(mode)
            onChange(mode)
          }}
          sx={pillSx(value === mode)}
        />
      ))}
    </Box>
  )
}

export function MatchingModeBar({
  ownerMode,
  modeLocked,
  activeMode,
  onModeChange,
}: {
  ownerMode: MatchingMode
  modeLocked: boolean
  activeMode: MatchingMode
  onModeChange: (m: MatchingMode) => void
}) {
  if (modeLocked) {
    return (
      <Box className="surfaceCard" sx={{ px: 1.5, py: 1.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Matching style
        </Typography>
        <Chip label={MATCHING_MODE_LABELS[ownerMode]} sx={pillSx(true)} />
      </Box>
    )
  }

  return (
    <Box className="surfaceCard" sx={{ px: 1.5, py: 1.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        How do you want to match?
      </Typography>
      <MatchingModePicker value={activeMode} onChange={onModeChange} />
    </Box>
  )
}
