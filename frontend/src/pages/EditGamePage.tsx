import { useParams } from 'react-router-dom'

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="page">
      <h1>Edit Game</h1>
      <p>
        Game ID: <code>{id}</code>
      </p>
      <p>Coming soon: edit people, metadata, tags, settings.</p>
    </div>
  )
}

