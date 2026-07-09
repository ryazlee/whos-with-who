import { Button, Stack } from '@mui/material'
import { APP_HOME_HREF } from '../lib/appBase'

type Props = {
  message: string
}

export default function PageError({ message }: Props) {
  return (
    <Stack spacing={1.5}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{message}</span>
      <Button component="a" href={APP_HOME_HREF} size="small" sx={{ alignSelf: 'flex-start' }}>
        Home
      </Button>
    </Stack>
  )
}
