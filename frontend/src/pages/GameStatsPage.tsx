import { Button } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function GameStatsPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="page">
      <PageHeader title="Stats" subtitle={`Game ${id}`} />
      <EmptyState
        title="Coming soon"
        description="Score distributions and creator analytics will live here."
        action={
          <Button component={RouterLink} to="/" variant="outlined">
            Back home
          </Button>
        }
      />
    </div>
  )
}
