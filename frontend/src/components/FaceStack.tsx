import { Box } from '@mui/material'

type PreviewPerson = {
  id: string
  name: string
  imageUrl: string
}

type Props = {
  people: PreviewPerson[]
  totalCount?: number
  size?: number
  max?: number
}

const OVERLAP = 0.26

/** Total horizontal space for a stack with `max` slots (px). */
export function faceStackWidth(size: number, max: number): number {
  const pad = size * 0.2
  const step = size * (1 - OVERLAP)
  return pad + size + (max - 1) * step
}

const faceImgSx = (size: number, index: number) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  objectFit: 'cover' as const,
  border: '2px solid',
  borderColor: 'background.paper',
  ml: index === 0 ? `-${size * 0.2}px` : `-${size * OVERLAP}px`,
  position: 'relative' as const,
  flexShrink: 0,
  bgcolor: 'divider',
})

const slotSx = (size: number, index: number, zIndex: number) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  ml: index === 0 ? `-${size * 0.2}px` : `-${size * OVERLAP}px`,
  position: 'relative' as const,
  zIndex,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  border: '2px solid',
  borderColor: 'background.paper',
})

export default function FaceStack({ people, totalCount, size = 40, max = 4 }: Props) {
  const count = totalCount ?? people.length
  const overflow = Math.max(0, count - max)
  const faceCount = overflow > 0 ? max - 1 : Math.min(people.length, max)
  const placeholderCount = overflow > 0 ? 0 : Math.max(0, max - faceCount)
  const width = faceStackWidth(size, max)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        pl: `${size * 0.2}px`,
        width,
        minWidth: width,
        maxWidth: width,
        height: size,
        flexShrink: 0,
      }}
      aria-hidden
    >
      {people.slice(0, faceCount).map((p, i) => (
        <Box
          key={p.id}
          component="img"
          src={p.imageUrl}
          alt={p.name}
          title={p.name}
          sx={{ ...faceImgSx(size, i), zIndex: max - i }}
        />
      ))}

      {overflow > 0 ? (
        <Box
          sx={{
            ...slotSx(size, faceCount, 0),
            bgcolor: 'action.hover',
            fontSize: size * 0.28,
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          +{overflow}
        </Box>
      ) : null}

      {Array.from({ length: placeholderCount }, (_, i) => {
        const index = faceCount + i
        return (
          <Box
            key={`placeholder-${index}`}
            sx={{
              ...slotSx(size, index, max - index),
              bgcolor: 'action.hover',
              opacity: 0.35,
            }}
          />
        )
      })}
    </Box>
  )
}
