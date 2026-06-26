import { useEffect, useState } from 'react'
import { useAuth } from './authContext'
import { getRanking, type RankingEntry } from './api'

const MEDALS = ['🥇', '🥈', '🥉']

export function Ranking() {
  const { getIdToken } = useAuth()
  const [rows, setRows] = useState<RankingEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getRanking(getIdToken)
      .then((res) => active && setRows(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [getIdToken])

  if (loading) return <p className="history-empty">Loading…</p>
  if (error) return <p className="history-error">Couldn’t load: {error}</p>
  if (rows.length === 0)
    return <p className="history-empty">No one on the board yet.</p>

  return (
    <div className="panel">
      <ul className="ranking">
        <li className="ranking-head">
          <span className="rank-pos">#</span>
          <span className="rank-name">Player</span>
          <span className="rank-num" title="Rewards">🎁</span>
          <span className="rank-num super-num" title="Super rewards">✨</span>
          <span className="rank-num used-num" title="Used">✓</span>
        </li>
        {rows.map((r, i) => (
          <li key={r.name + i}>
            <span className="rank-pos">{MEDALS[i] ?? i + 1}</span>
            <span className="rank-name">{r.name}</span>
            <span className="rank-num">{r.rewards}</span>
            <span className="rank-num super-num">{r.superRewards}</span>
            <span className="rank-num used-num">{r.used}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
