import { Box, Typography } from '@mui/material'
import type { Person } from '../game/types'

type Props = {
  person: Person
  size?: number
  selected?: boolean
  paired?: boolean
  showName?: boolean
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
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
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
        width: size + 16,
      }}
    >
      <Box
        component="img"
        src={person.imageUrl}
        alt={person.name}
        sx={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: 1.5,
          border: '2px solid',
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
        }}
      >
        {person.name}
      </Typography>
    </Box>
  )
}
