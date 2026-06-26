export type Reward = {
  label: string
  emoji: string
}

// The wheel segments — also the choices when claiming a super reward.
export const REWARDS: Reward[] = [
  { label: 'Supi gemacht!', emoji: '🎉' },
  { label: 'Send a selfie', emoji: '📸' },
  { label: 'Get a praise from your buddy', emoji: '🤗' },
  { label: '2€ personal use', emoji: '💰' },
  { label: 'Coffee outside', emoji: '☕' },
  { label: '5€ Gemeinschaftskasse', emoji: '🏦' },
  { label: 'Joker — choose any reward you like!', emoji: '🃏' },
]

// Normal rewards needed to claim one super reward (mirrors the backend).
export const SUPER_COST = 10
