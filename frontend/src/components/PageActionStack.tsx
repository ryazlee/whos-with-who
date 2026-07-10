import { Stack } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  spacing?: number
}

/** Vertical stack for full-width page CTAs at the bottom of a page. */
export default function PageActionStack({ children, spacing = 1.5 }: Props) {
  return <Stack spacing={spacing}>{children}</Stack>
}
