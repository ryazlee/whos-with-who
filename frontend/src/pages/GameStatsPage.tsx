import { useParams } from 'react-router-dom'

export default function GameStatsPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="page">
      <h1>Stats</h1>
      <p>
        Game ID: <code>{id}</code>
      </p>
      <p>Coming soon: creator analytics and score distributions.</p>
    </div>
  )
}

