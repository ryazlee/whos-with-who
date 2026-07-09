import { Typography, type SxProps, type Theme } from '@mui/material'

type Props = {
  name: string | null | undefined
  prefix?: string
  variant?: 'caption' | 'body2'
  sx?: SxProps<Theme>
}

export default function GameAuthorLine({ name, prefix = 'By', variant = 'caption', sx }: Props) {
  const trimmed = name?.trim()
  if (!trimmed) return null

  return (
    <Typography variant={variant} color="text.secondary" sx={{ lineHeight: 1.45, ...sx }}>
      {prefix} {trimmed}
    </Typography>
  )
}
