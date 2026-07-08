import { Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page">
      <Typography variant="body2" color="text.secondary">
        <RouterLink to="/" style={{ color: 'inherit' }}>
          Home
        </RouterLink>
      </Typography>
    </div>
  )
}
