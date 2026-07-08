import { Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

type Props = {
  message: string
}

export default function PageError({ message }: Props) {
  return (
    <Stack spacing={1.5}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{message}</span>
      <Button component={RouterLink} to="/" size="small" sx={{ alignSelf: 'flex-start' }}>
        Home
      </Button>
    </Stack>
  )
}
