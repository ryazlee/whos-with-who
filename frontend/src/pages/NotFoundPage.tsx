import PrimaryActionButton from '../components/PrimaryActionButton'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader title="Not found" subtitle="That page doesn't exist." />
      <EmptyState
        title="Lost?"
        description="Head back home and pick a game to play."
        action={<PrimaryActionButton to="/" label="Go home" />}
      />
    </div>
  )
}
