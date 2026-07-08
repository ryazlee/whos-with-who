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
            borderRadius: '38%',
            objectFit: 'cover',
            border: '2.5px solid',
            borderColor: 'background.paper',
            ml: i === 0 ? `-${size * 0.22}px` : `-${size * 0.3}px`,
            position: 'relative',
            zIndex: shown.length - i,
            bgcolor: 'divider',
            boxShadow: '0 2px 6px rgba(45, 36, 32, 0.12)',
          }}
        />
      ))}
      {leftover > 0 ? (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '38%',
            ml: `-${size * 0.3}px`,
            position: 'relative',
            zIndex: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'secondary.main',
            border: '2.5px solid',
            borderColor: 'background.paper',
            fontSize: size * 0.28,
            fontWeight: 700,
            color: 'secondary.contrastText',
            boxShadow: '0 2px 6px rgba(45, 36, 32, 0.1)',
          }}
        >
          +{leftover}
        </Box>
      ) : null}
    </Box>
  )
}
