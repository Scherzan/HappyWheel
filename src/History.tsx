import { useEffect, useState } from 'react'
import { useAuth } from './authContext'
import { listResults, type SpinResult } from './api'

// `version` bumps after each saved spin so the list refetches.
export function History({ version }: { version: number }) {
  const { getIdToken } = useAuth()
  const [items, setItems] = useState<SpinResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listResults(getIdToken)
      .then((res) => active && setItems(res))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [getIdToken, version])

  if (error) return <p className="history-error">Couldn’t load history: {error}</p>
  if (items.length === 0) return <p className="history-empty">No spins yet.</p>

  return (
    <ul className="history">
      {items.map((item) => (
        <li key={item.spinId}>
          <span className="history-reward">
            {item.emoji} {item.reward}
          </span>
          <time dateTime={item.createdAt}>
            {new Date(item.createdAt).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  )
}
