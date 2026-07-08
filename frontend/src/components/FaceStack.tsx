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

export default function FaceStack({ people, totalCount, size = 40, max = 4 }: Props) {
  const shown = people.slice(0, max)
  const leftover = Math.max(0, (totalCount ?? people.length) - shown.length)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: `${size * 0.22}px` }}>
      {shown.map((p, i) => (
        <Box
          key={p.id}
          component="img"
          src={p.imageUrl}
          alt={p.name}
          title={p.name}
          sx={{
            width: size,
            height: size,
            borderRadius: '42%',
            objectFit: 'cover',
            border: '2.5px solid',
            borderColor: 'background.paper',
            ml: i === 0 ? `-${size * 0.22}px` : `-${size * 0.28}px`,
            position: 'relative',
            zIndex: shown.length - i,
            bgcolor: 'divider',
            boxShadow: '0 1px 2px rgba(42, 38, 35, 0.08)',
          }}
        />
      ))}
      {leftover > 0 ? (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '42%',
            ml: `-${size * 0.28}px`,
            position: 'relative',
            zIndex: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            border: '2.5px solid',
            borderColor: 'background.paper',
            fontSize: size * 0.28,
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          +{leftover}
        </Box>
      ) : null}
    </Box>
  )
}
