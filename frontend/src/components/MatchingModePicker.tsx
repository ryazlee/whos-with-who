import { Box, Chip, Stack } from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import { MATCHING_MODE_LABELS, MATCHING_MODES } from '../game/matchingModes'
import { setPreferredMatchingMode } from '../lib/matchingModePreference'

type Props = {
  value: MatchingMode
  onChange: (mode: MatchingMode) => void
}

export default function MatchingModePicker({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={0.75}>
      {MATCHING_MODES.map((mode) => (
        <Chip
          key={mode}
          label={MATCHING_MODE_LABELS[mode]}
          size="small"
          color={value === mode ? 'primary' : 'default'}
          variant={value === mode ? 'filled' : 'outlined'}
          onClick={() => {
            setPreferredMatchingMode(mode)
            onChange(mode)
          }}
          sx={{ fontWeight: 600, fontSize: 11 }}
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
        <Chip label={MATCHING_MODE_LABELS[ownerMode]} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
      </Box>
    )
  }

  return <MatchingModePicker value={activeMode} onChange={onModeChange} />
}
