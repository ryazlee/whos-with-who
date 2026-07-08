import { Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader title="Not found" subtitle="That page doesn't exist." />
      <EmptyState
        title="Lost?"
        description="Head back home and pick a game to play."
        action={
          <Button component={RouterLink} to="/" variant="contained">
            Go home
          </Button>
        }
      />
    </div>
  )
}
