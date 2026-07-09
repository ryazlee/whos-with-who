import { Box, Typography } from '@mui/material'
import type { Person } from '../game/types'
import { useCachedPersonImageUrl } from '../lib/imageCache'

type Props = {
  person: Person
  size?: number
  selected?: boolean
  paired?: boolean
  showName?: boolean
  /** Smaller label for dense layouts (e.g. draw lines with many people). */
  compact?: boolean
  onClick?: () => void
  draggable?: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
}

export default function PersonAvatar({
  person,
  size = 72,
  selected,
  paired,
  showName = true,
  compact,
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const src = useCachedPersonImageUrl(person.imageUrl, person.name)

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      draggable={draggable}
      onDragStart={(e) => {
        if (draggable) {
          e.dataTransfer.effectAllowed = 'link'
          onDragStart?.()
        }
      }}
      onDragOver={(e) => {
        if (draggable) {
          e.preventDefault()
          onDragOver?.(e)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop?.()
      }}
      sx={{
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        width: compact ? size + 10 : size + 16,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={person.name}
        sx={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: compact ? 1.25 : 1.5,
          border: compact ? '1.5px solid' : '2px solid',
          borderColor: selected ? 'primary.main' : paired ? 'divider' : 'divider',
          opacity: paired ? 0.85 : 1,
          transition: 'border-color 0.15s, transform 0.1s',
          transform: selected ? 'scale(1.04)' : 'none',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          lineHeight: 1.2,
          textAlign: 'center',
          display: showName ? 'block' : 'none',
          fontSize: compact ? '0.625rem' : undefined,
          maxWidth: size + (compact ? 12 : 20),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {person.name}
      </Typography>
    </Box>
  )
}
