import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './authContext'
import { claimSuper, listResults, markUsed, type SpinResult } from './api'
import { REWARDS, SUPER_COST, type Reward } from './rewards'

// `version` bumps after each saved spin (or a redemption) so the list refetches.
export function History({
  version,
  onUsed,
}: {
  version: number
  onUsed: () => void
}) {
  const { getIdToken } = useAuth()
  const [items, setItems] = useState<SpinResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [usingId, setUsingId] = useState<string | null>(null)
  const [onlyUnused, setOnlyUnused] = useState(true)

  // Super-reward claim state.
  const [claiming, setClaiming] = useState(false)
  const [selected, setSelected] = useState<Reward | null>(null)
  const [claimBusy, setClaimBusy] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    listResults(getIdToken)
      .then((res) => active && setItems(res))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [getIdToken, version])

  const use = useCallback(
    async (spinId: string) => {
      setUsingId(spinId)
      setError(null)
      try {
        const updated = await markUsed(spinId, getIdToken)
        setItems((prev) =>
          prev.map((it) => (it.spinId === spinId ? updated : it)),
        )
        onUsed()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not use reward')
      } finally {
        setUsingId(null)
      }
    },
    [getIdToken, onUsed],
  )

  const confirmClaim = useCallback(async () => {
    if (!selected) return
    setClaimBusy(true)
    setClaimError(null)
    try {
      await claimSuper(selected.label, selected.emoji, getIdToken)
      setClaiming(false)
      setSelected(null)
      onUsed()
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Could not claim')
    } finally {
      setClaimBusy(false)
    }
  }, [selected, getIdToken, onUsed])

  if (error) return <p className="history-error">Couldn’t load: {error}</p>

  // Progress toward a super reward: each normal reward is a point, each super
  // reward spent 10. Mirrors the server's eligibility check.
  const superCount = items.filter((it) => it.isSuper).length
  const normalCount = items.length - superCount
  const progress = normalCount - SUPER_COST * superCount
  const canClaim = progress >= SUPER_COST

  const shown = onlyUnused ? items.filter((it) => !it.used) : items

  return (
    <div className="panel">
      <div className="list-toolbar">
        <label className="filter">
          <input
            type="checkbox"
            checked={onlyUnused}
            onChange={(e) => setOnlyUnused(e.target.checked)}
          />
          Only show unused
        </label>

        <div
          className="super-inline"
          title={
            canClaim
              ? 'Claim your super reward!'
              : `Collect ${SUPER_COST} rewards to claim a super reward`
          }
        >
          <span className="super-counter">
            {canClaim
              ? '✨ Super reward ready!'
              : `✨ ${progress} / ${SUPER_COST} to claim a super reward`}
          </span>
          {canClaim && (
            <button
              type="button"
              className="claim-btn"
              onClick={() => setClaiming((c) => !c)}
            >
              {claiming ? 'Close' : 'Claim'}
            </button>
          )}
        </div>
      </div>

      {claiming && canClaim && (
        <div className="claim-flow">
          <div className="claim-row">
            {REWARDS.map((r) => (
              <label
                key={r.label}
                className={
                  selected?.label === r.label
                    ? 'claim-chip selected'
                    : 'claim-chip'
                }
                title={r.label}
              >
                <input
                  type="checkbox"
                  checked={selected?.label === r.label}
                  onChange={() =>
                    setSelected((cur) => (cur?.label === r.label ? null : r))
                  }
                />
                <span className="claim-emoji">{r.emoji}</span>
              </label>
            ))}
          </div>
          {claimError && <p className="auth-error">{claimError}</p>}
          <div className="claim-actions">
            <button
              type="button"
              className="claim-btn"
              disabled={!selected || claimBusy}
              onClick={confirmClaim}
            >
              {claimBusy ? 'Claiming…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="history-empty">
          {items.length === 0 ? 'No rewards yet.' : 'No unused rewards.'}
        </p>
      ) : (
        <ul className="history">
          {shown.map((item) => (
            <li
              key={item.spinId}
              className={
                [item.isSuper && 'super', item.used && 'used']
                  .filter(Boolean)
                  .join(' ') || undefined
              }
            >
              <div className="history-main">
                <span className="history-reward">
                  {item.emoji} {item.reward}
                </span>
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
              <div className="history-action">
                {item.used ? (
                  <span
                    className="used-badge"
                    title={`Used ${fmt(item.usedAt)}`}
                  >
                    ✓ Used{item.usedAt ? ` · ${fmt(item.usedAt)}` : ''}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="use-btn"
                    disabled={usingId === item.spinId}
                    onClick={() => use(item.spinId)}
                  >
                    {usingId === item.spinId ? 'Using…' : 'Use it'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function fmt(iso: string | undefined): string {
  return iso ? new Date(iso).toLocaleString() : ''
}
