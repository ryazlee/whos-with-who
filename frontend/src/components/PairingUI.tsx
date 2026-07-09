import {
  Box,
  Button,
  FormControl,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import { useCachedPersonImageUrl } from '../lib/imageCache'

export type PairingPerson = {
  id: string
  name: string
  imageUrl: string | null
}

function PersonThumb({ person, size = 40 }: { person: PairingPerson; size?: number }) {
  const src = useCachedPersonImageUrl(person.imageUrl ?? '', person.name)

  if (person.imageUrl) {
    return (
      <Box
        component="img"
        src={src}
        alt=""
        sx={{
          width: size,
          height: size,
          borderRadius: 1.25,
          objectFit: 'cover',
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      />
    )
  }

  const initial = person.name.trim().charAt(0).toUpperCase() || '?'
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.38,
        fontWeight: 600,
        color: 'text.secondary',
      }}
    >
      {initial}
    </Box>
  )
}

export function PairingProgress({
  total,
  assigned,
  singlesInGame,
  pairsInGame,
  hint,
}: {
  total: number
  assigned: number
  /** Singles defined by the game creator (not player progress). */
  singlesInGame?: number
  pairsInGame?: number
  hint?: string
}) {
  const remaining = Math.max(0, total - assigned)
  const pct = total > 0 ? Math.round((assigned / total) * 100) : 0

  const gameShape =
    singlesInGame != null && pairsInGame != null
      ? singlesInGame === 0
        ? `${pairsInGame} ${pairsInGame === 1 ? 'couple' : 'couples'} — pair everyone`
        : pairsInGame === 0
          ? `${singlesInGame} ${singlesInGame === 1 ? 'single' : 'singles'} in this game`
          : `${pairsInGame} ${pairsInGame === 1 ? 'pair' : 'pairs'} · ${singlesInGame} ${singlesInGame === 1 ? 'single' : 'singles'}`
      : null

  const status =
    remaining > 0
      ? hint ?? `${remaining} ${remaining === 1 ? 'person' : 'people'} left`
      : 'Everyone matched'

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {status}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {assigned}/{total}
        </Typography>
      </Box>
      {gameShape ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, lineHeight: 1.4 }}>
          {gameShape}
        </Typography>
      ) : null}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4,
          borderRadius: 99,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { borderRadius: 99 },
        }}
      />
    </Box>
  )
}

export function PairingSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <Box className="surfaceCard" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: 1.5, pt: 1.25, pb: subtitle ? 0.5 : 0.75 }}>
        <Typography className="section-label" component="p">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
        {children}
      </Stack>
    </Box>
  )
}

export function RemainingPeopleRow({ people }: { people: PairingPerson[] }) {
  if (people.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 0.25 }}>
      {people.map((p) => (
        <Box
          key={p.id}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.5,
            borderRadius: 99,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <PersonThumb person={p} size={24} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {p.name}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export function PairResultRow({
  left,
  right,
  onUnpair,
}: {
  left: PairingPerson
  right: PairingPerson
  onUnpair?: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1.1,
      }}
    >
      <PersonThumb person={left} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
          {left.name}
        </Typography>
      </Box>
      <FavoriteBorderOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
      <PersonThumb person={right} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
          {right.name}
        </Typography>
      </Box>
      {onUnpair ? (
        <Button
          size="small"
          color="inherit"
          onClick={onUnpair}
          sx={{ flexShrink: 0, fontSize: '0.8rem', minWidth: 0, px: 1 }}
        >
          Unpair
        </Button>
      ) : null}
    </Box>
  )
}

export function SingleResultRow({
  person,
  onChange,
}: {
  person: PairingPerson
  onChange?: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: 1.5,
        py: 1.1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <PersonThumb person={person} size={44} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {person.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Flying solo
          </Typography>
        </Box>
      </Box>
      {onChange ? (
        <Button size="small" color="inherit" onClick={onChange} sx={{ flexShrink: 0, fontSize: '0.8rem' }}>
          Change
        </Button>
      ) : null}
    </Box>
  )
}

export function PartnerPickerRow({
  person,
  options,
  allowSingle,
  value,
  onSelect,
}: {
  person: PairingPerson
  options: PairingPerson[]
  allowSingle: boolean
  value: '' | 'single' | string
  onSelect: (partnerId: string | null) => void
}) {
  const selectedPartner = value && value !== 'single' ? options.find((o) => o.id === value) : null

  return (
    <Box sx={{ px: 1.5, py: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
        <PersonThumb person={person} size={48} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {person.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Who are they with?
          </Typography>
        </Box>
      </Box>
      <FormControl fullWidth size="small">
        <Select
          value={value}
          displayEmpty
          onChange={(e) => {
            const v = e.target.value as string
            if (!v) return
            onSelect(v === 'single' ? null : v)
          }}
          sx={{
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            fontSize: '0.875rem',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          }}
          renderValue={() => {
            if (value === 'single') {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <span>Single</span>
                </Box>
              )
            }
            if (selectedPartner) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonThumb person={selectedPartner} size={24} />
                  <span>{selectedPartner.name}</span>
                </Box>
              )
            }
            return (
              <Typography component="span" variant="body2" color="text.secondary">
                Choose partner…
              </Typography>
            )
          }}
        >
          {allowSingle ? (
            <MenuItem value="single">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Single
              </Box>
            </MenuItem>
          ) : null}
          {options.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonThumb person={opt} size={28} />
                {opt.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
