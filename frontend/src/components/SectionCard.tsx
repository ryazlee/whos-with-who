import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  title?: string
  subtitle?: string
  children: ReactNode
  noPadding?: boolean
}

export default function SectionCard({ title, subtitle, children, noPadding }: Props) {
  return (
    <Box className="surfaceCard">
      {title ? (
        <Box sx={{ px: 2, pt: 1.75, pb: subtitle ? 0.5 : 1 }}>
          <Typography className="section-label" component="p">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, lineHeight: 1.45 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Box sx={{ px: noPadding ? 0 : 2, pb: noPadding ? 0 : 2, pt: title ? 0 : 2 }}>{children}</Box>
    </Box>
  )
}
