import { Button } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="page">
      <PageHeader title="Edit game" subtitle={`Game ${id}`} />
      <EmptyState
        title="Coming soon"
        description="Editing people, tags, and settings isn't available yet."
        action={
          <Button component={RouterLink} to="/" variant="outlined">
            Back home
          </Button>
        }
      />
    </div>
  )
}
