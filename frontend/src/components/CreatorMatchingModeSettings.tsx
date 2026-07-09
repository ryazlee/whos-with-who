import {
  Box,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import type { MatchingMode } from '../game/matchingModes'
import {
  MATCHING_MODE_DESCRIPTIONS,
  MATCHING_MODE_LABELS,
  MATCHING_MODES,
} from '../game/matchingModes'

const pillSx = (active: boolean, disabled?: boolean) => ({
  height: 36,
  fontSize: '0.85rem',
  fontWeight: 500,
  borderRadius: '99px',
  cursor: disabled ? 'default' : 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? 'primary.main' : 'transparent',
  color: active ? 'primary.contrastText' : 'text.secondary',
  opacity: disabled ? 0.55 : 1,
  '& .MuiChip-label': { px: 1.25 },
})

type Props = {
  modeLocked: boolean
  onModeLockedChange: (locked: boolean) => void
  lockedMode: MatchingMode
  onLockedModeChange: (mode: MatchingMode) => void
  allowedModes: MatchingMode[]
  onAllowedModesChange: (modes: MatchingMode[]) => void
}

function ModeOptionCard({
  mode,
  active,
  onClick,
  disabled,
}: {
  mode: MatchingMode
  active: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      sx={{
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 1.25,
        textAlign: 'left',
        bgcolor: active ? 'action.selected' : 'transparent',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        width: '100%',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
        {MATCHING_MODE_LABELS[mode]}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
        {MATCHING_MODE_DESCRIPTIONS[mode]}
      </Typography>
    </Box>
  )
}

export default function CreatorMatchingModeSettings({
  modeLocked,
  onModeLockedChange,
  lockedMode,
  onLockedModeChange,
  allowedModes,
  onAllowedModesChange,
}: Props) {
  function toggleAllowedMode(mode: MatchingMode) {
    const has = allowedModes.includes(mode)
    if (has && allowedModes.length <= 1) return
    const next = has ? allowedModes.filter((m) => m !== mode) : [...allowedModes, mode]
    onAllowedModesChange(next.sort((a, b) => MATCHING_MODES.indexOf(a) - MATCHING_MODES.indexOf(b)))
  }

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={modeLocked}
            onChange={(_, checked) => onModeLockedChange(checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Lock matching style for players
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {modeLocked
                ? 'Players must use the style you pick below.'
                : 'Players can switch between the styles you allow.'}
            </Typography>
          </Box>
        }
        sx={{ alignItems: 'flex-start', ml: 0, mr: 0 }}
      />

      {modeLocked ? (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Required style
          </Typography>
          <Stack spacing={0.75}>
            {MATCHING_MODES.map((mode) => (
              <ModeOptionCard
                key={mode}
                mode={mode}
                active={lockedMode === mode}
                onClick={() => onLockedModeChange(mode)}
              />
            ))}
          </Stack>
        </Box>
      ) : (
        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Styles players can use
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.45 }}>
            Select at least one. All three are on by default.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
            {MATCHING_MODES.map((mode) => (
              <Chip
                key={mode}
                label={MATCHING_MODE_LABELS[mode]}
                onClick={() => toggleAllowedMode(mode)}
                sx={pillSx(allowedModes.includes(mode))}
              />
            ))}
          </Box>
          <Stack spacing={0.75}>
            {allowedModes.map((mode) => (
              <ModeOptionCard key={mode} mode={mode} active />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
