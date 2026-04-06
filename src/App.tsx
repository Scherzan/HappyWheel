import { useEffect, useRef, useState } from 'react'
import './App.css'

const REWARDS = [
  'Supi gemacht! 🎉',
  'Send a selfie 📸',
  'Get a praise from your buddy 🤗',
  '2€ personal use 💰',
  'Coffee outside ☕',
  '5€ Gemeinschaftskasse 🏦',
]

const SEGMENT_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9f45', '#c77dff']

const SEGMENT_PATHS = [
  'M 100 100 L 200 100 A 100 100 0 0 1 150 186.6 Z',
  'M 100 100 L 150 186.6 A 100 100 0 0 1 50 186.6 Z',
  'M 100 100 L 50 186.6 A 100 100 0 0 1 0 100 Z',
  'M 100 100 L 0 100 A 100 100 0 0 1 50 13.4 Z',
  'M 100 100 L 50 13.4 A 100 100 0 0 1 150 13.4 Z',
  'M 100 100 L 150 13.4 A 100 100 0 0 1 200 100 Z',
]

function LuckyWheel() {
  return (
    <svg viewBox="0 0 200 200" className="wheel" aria-label="Lucky wheel spinning">
      {SEGMENT_PATHS.map((d, i) => (
        <path key={i} d={d} fill={SEGMENT_COLORS[i]} stroke="#fff" strokeWidth="2" />
      ))}
      <circle cx="100" cy="100" r="10" fill="#fff" stroke="#ccc" strokeWidth="2" />
    </svg>
  )
}

function App() {
  const [message, setMessage] = useState('')
  const [spinning, setSpinning] = useState(false)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  const handleGetReward = () => {
    setMessage('')
    setSpinning(true)
    spinTimeoutRef.current = setTimeout(() => {
      const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)]
      setSpinning(false)
      setMessage(reward)
    }, 2000)
  }

  return (
    <div className="app">
      <h1>HappyWheel</h1>
      {spinning && (
        <div className="wheel-container">
          <div className="wheel-pointer" />
          <LuckyWheel />
        </div>
      )}
      <button onClick={handleGetReward} disabled={spinning}>
        Get Reward
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App
