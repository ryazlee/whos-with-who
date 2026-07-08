import { CircularProgress, Stack } from '@mui/material'

export default function PageLoading() {
  return (
    <Stack sx={{ alignItems: 'center', py: 4 }}>
      <CircularProgress size={24} color="primary" />
    </Stack>
  )
}
