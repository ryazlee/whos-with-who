import { Button, type ButtonProps } from '@mui/material'
import { Link as RouterLink, type To } from 'react-router-dom'

type Props = Omit<ButtonProps, 'children'> & {
  label: string
  to?: To
}

/** Full-width primary CTA — same on mobile and desktop. */
export default function PrimaryActionButton({ label, to, sx, ...props }: Props) {
  const linkProps = to != null ? { component: RouterLink, to } : {}

  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      size="large"
      sx={{
        py: 1.35,
        fontSize: '1rem',
        fontWeight: 600,
        ...sx,
      }}
      {...linkProps}
      {...props}
    >
      {label}
    </Button>
  )
}
