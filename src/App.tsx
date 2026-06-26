import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useAuth } from './authContext'
import { AuthForm } from './AuthForm'
import { History } from './History'
import { Account } from './Account'
import { Ranking } from './Ranking'
import { saveResult } from './api'
import { useTheme, type Theme } from './theme'
import { REWARDS, type Reward } from './rewards'

const COLORS = [
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#ff9f45',
  '#c77dff',
  '#54d1db',
]

// Spin physics: random duration and speed decide where the wheel stops.
const MIN_DURATION = 2 // seconds
const MAX_DURATION = 5 // seconds
const MIN_SPEED = 10 // rounds per second
const MAX_SPEED = 30 // rounds per second

const SEGMENT = 360 / REWARDS.length

// Convert a clockwise angle (0° = top, where the pointer sits) to SVG coords.
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: 100 + radius * Math.sin(rad),
    y: 100 - radius * Math.cos(rad),
  }
}

function segmentPath(index: number) {
  const start = polar(index * SEGMENT, 100)
  const end = polar((index + 1) * SEGMENT, 100)
  return `M 100 100 L ${start.x} ${start.y} A 100 100 0 0 1 ${end.x} ${end.y} Z`
}

// Which reward sits under the pointer after rotating the wheel `rotation` degrees clockwise.
function rewardAt(rotation: number) {
  const landed = ((-rotation % 360) + 360) % 360
  return Math.floor(landed / SEGMENT) % REWARDS.length
}

function LuckyWheel({
  rotation,
  duration,
}: {
  rotation: number
  duration: number
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="wheel"
      aria-label="Lucky reward wheel"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: `transform ${duration}s cubic-bezier(0.16, 0.84, 0.2, 1)`,
      }}
    >
      {REWARDS.map((reward, i) => {
        const labelPos = polar((i + 0.5) * SEGMENT, 64)
        return (
          <g key={i}>
            <path
              d={segmentPath(i)}
              fill={COLORS[i]}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {reward.emoji}
            </text>
          </g>
        )
      })}
      <circle cx="100" cy="100" r="10" fill="#fff" stroke="#ccc" strokeWidth="2" />
    </svg>
  )
}

function Wheel({ onSaved }: { onSaved: () => void }) {
  const { getIdToken } = useAuth()
  const [rotation, setRotation] = useState(0)
  const [duration, setDuration] = useState(MIN_DURATION)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Reward | null>(null)
  const rotationRef = useRef(0)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  const handleSpin = () => {
    if (spinning) return
    setResult(null)
    setSpinning(true)

    const spinDuration =
      MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION)
    const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)
    const delta = speed * spinDuration * 360 // total rotation in degrees
    const next = rotationRef.current + delta
    rotationRef.current = next

    setDuration(spinDuration)
    setRotation(next)
    spinTimeoutRef.current = setTimeout(() => {
      setSpinning(false)
      const landed = REWARDS[rewardAt(next)]
      setResult(landed)
      // Persist the result for the logged-in user, then refresh history.
      saveResult(
        {
          reward: landed.label,
          emoji: landed.emoji,
          durationMs: Math.round(spinDuration * 1000),
          speed,
        },
        getIdToken,
      )
        .then(onSaved)
        .catch((err) => console.error('Failed to save result', err))
    }, spinDuration * 1000)
  }

  return (
    <div className="panel panel-center">
      <p className="spin-hint">{spinning ? '🎡 Spinning…' : '🎡 Tap to spin'}</p>
      <div
        className="wheel-container"
        onClick={handleSpin}
        role="button"
        aria-label="Spin the wheel"
      >
        <div className="wheel-pointer" />
        <LuckyWheel rotation={rotation} duration={duration} />
      </div>
      {result && (
        <p className="message">
          {result.emoji} {result.label}
        </p>
      )}
    </div>
  )
}

// Monochrome icons drawn with currentColor so they follow the active theme.
const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
)

const LogoutIcon = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

const MoonIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
)

const SunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

type Tab = 'wheel' | 'spins' | 'ranking' | 'account'

function Shell({
  theme,
  onToggleTheme,
}: {
  theme: Theme
  onToggleTheme: () => void
}) {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('wheel')
  // Bumped after a spin is saved or a reward is used, so History refetches.
  const [historyVersion, setHistoryVersion] = useState(0)
  const bump = () => setHistoryVersion((v) => v + 1)

  return (
    <div className="app">
      <header className="tabbar">
        <div className="brand">🎡 HappyWheel</div>
        <nav className="tabs">
          <button
            className={tab === 'wheel' ? 'tab active' : 'tab'}
            onClick={() => setTab('wheel')}
          >
            Wheel
          </button>
          <button
            className={tab === 'spins' ? 'tab active' : 'tab'}
            onClick={() => setTab('spins')}
          >
            Your Rewards
          </button>
          <button
            className={tab === 'ranking' ? 'tab active' : 'tab'}
            onClick={() => setTab('ranking')}
          >
            Ranking
          </button>
        </nav>
        <div className="tabbar-right">
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={tab === 'account' ? 'icon-btn active' : 'icon-btn'}
            onClick={() => setTab('account')}
            title={user?.email ?? 'Account'}
            aria-label="Account"
          >
            <UserIcon />
          </button>
          <button
            className="icon-btn"
            onClick={signOut}
            title="Log out"
            aria-label="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main className="content">
        {tab === 'wheel' && <Wheel onSaved={bump} />}
        {tab === 'spins' && <History version={historyVersion} onUsed={bump} />}
        {tab === 'ranking' && <Ranking />}
        {tab === 'account' && <Account />}
      </main>
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()
  const { theme, toggle } = useTheme()
  if (loading) {
    return <div className="app">Loading…</div>
  }
  return user ? (
    <Shell theme={theme} onToggleTheme={toggle} />
  ) : (
    <div className="app">
      <h1>HappyWheel</h1>
      <AuthForm />
    </div>
  )
}

export default App
