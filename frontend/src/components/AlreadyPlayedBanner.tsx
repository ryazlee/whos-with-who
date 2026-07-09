import { Alert, Box, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { AttemptResult } from '../datastore/types'

type Props = {
  attempt: AttemptResult
}

export default function AlreadyPlayedBanner({ attempt }: Props) {
  return (
    <Alert
      severity="info"
      variant="outlined"
      sx={{
        alignItems: 'center',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          width: '100%',
        }}
      >
        <span>
          You already played this game — score <strong>{attempt.score100}</strong>. Your picks are
          shown below (read-only).
        </span>
        <Button
          component={RouterLink}
          to={`/attempt/${attempt.attemptId}/result`}
          size="small"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        >
          View score
        </Button>
      </Box>
    </Alert>
  )
}
