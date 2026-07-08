import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <Box className="emptyState">
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320, mx: 'auto' }}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </Box>
  )
}
