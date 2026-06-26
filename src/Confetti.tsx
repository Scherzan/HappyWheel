import { useState } from 'react'

const COLORS = [
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#ff9f45',
  '#c77dff',
  '#54d1db',
]

type Piece = {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  drift: number
}

// A short burst of falling confetti for celebrating a result.
export function Confetti({ count = 80 }: { count?: number }) {
  // Randomize once on mount via a lazy state initializer.
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 1.8,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 7,
      drift: (Math.random() - 0.5) * 120,
    })),
  )

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
