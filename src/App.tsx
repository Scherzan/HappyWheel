import { useEffect, useRef, useState } from 'react'
import './App.css'

type Reward = {
  label: string
  emoji: string
}

const REWARDS: Reward[] = [
  { label: 'Supi gemacht!', emoji: '🎉' },
  { label: 'Send a selfie', emoji: '📸' },
  { label: 'Get a praise from your buddy', emoji: '🤗' },
  { label: '2€ personal use', emoji: '💰' },
  { label: 'Coffee outside', emoji: '☕' },
  { label: '5€ Gemeinschaftskasse', emoji: '🏦' },
  { label: 'Joker — choose any reward you like!', emoji: '🃏' },
]

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

function App() {
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
      setResult(REWARDS[rewardAt(next)])
    }, spinDuration * 1000)
  }

  return (
    <div className="app">
      <h1>HappyWheel</h1>
      <div className="wheel-container">
        <div className="wheel-pointer" />
        <LuckyWheel rotation={rotation} duration={duration} />
      </div>
      <button onClick={handleSpin} disabled={spinning}>
        {spinning ? 'Spinning…' : 'Get Reward'}
      </button>
      {result && (
        <p className="message">
          {result.emoji} {result.label}
        </p>
      )}
    </div>
  )
}

export default App
