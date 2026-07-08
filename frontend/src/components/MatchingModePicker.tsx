import { Box, Chip, Stack } from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS, MATCHING_MODES } from '../game/matchingModes'
import { setPreferredMatchingMode } from '../lib/matchingModePreference'

const pillSx = (active: boolean) => ({
  height: 28,
  fontSize: '0.8rem',
  fontWeight: 500,
  borderRadius: '99px',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? 'primary.main' : 'background.paper',
  color: active ? 'primary.contrastText' : 'text.secondary',
  '& .MuiChip-label': { px: 1 },
})

type Props = {
  value: MatchingMode
  onChange: (mode: MatchingMode) => void
}

export default function MatchingModePicker({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={0.5}>
      {MATCHING_MODES.map((mode) => (
        <Chip
          key={mode}
          label={MATCHING_MODE_LABELS[mode]}
          size="small"
          onClick={() => {
            setPreferredMatchingMode(mode)
            onChange(mode)
          }}
          sx={pillSx(value === mode)}
        />
      ))}
    </Stack>
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
      <Box>
        <Chip label={MATCHING_MODE_LABELS[ownerMode]} size="small" sx={pillSx(true)} />
      </Box>
    )
  }

  return <MatchingModePicker value={activeMode} onChange={onModeChange} />
}
