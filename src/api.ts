import { config } from './config'

export type SpinResult = {
  userId: string
  spinId: string
  reward: string
  emoji: string
  createdAt: string
  durationMs?: number
  speed?: number
  used?: boolean
  usedAt?: string
  isSuper?: boolean
}

export type NewSpinResult = {
  reward: string
  emoji: string
  durationMs?: number
  speed?: number
}

// getToken is injected by the caller (from useAuth) so this module stays auth-agnostic.
type GetToken = () => Promise<string>

async function request<T>(
  path: string,
  getToken: GetToken,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function saveResult(
  result: NewSpinResult,
  getToken: GetToken,
): Promise<SpinResult> {
  return request<SpinResult>('/results', getToken, {
    method: 'POST',
    body: JSON.stringify(result),
  })
}

export async function listResults(getToken: GetToken): Promise<SpinResult[]> {
  const data = await request<{ items: SpinResult[] }>('/results', getToken)
  return data.items
}

// Redeem a reward once. The server rejects a second use (409 -> throws).
export function markUsed(
  spinId: string,
  getToken: GetToken,
): Promise<SpinResult> {
  return request<SpinResult>('/results/use', getToken, {
    method: 'POST',
    body: JSON.stringify({ spinId }),
  })
}

export type RankingEntry = {
  name: string
  rewards: number
  superRewards: number
  used: number
}

export async function getRanking(getToken: GetToken): Promise<RankingEntry[]> {
  const data = await request<{ ranking: RankingEntry[] }>('/ranking', getToken)
  return data.ranking
}

// Spend 10 rewards on a chosen reward. The server re-checks eligibility (409).
export function claimSuper(
  reward: string,
  emoji: string,
  getToken: GetToken,
): Promise<SpinResult> {
  return request<SpinResult>('/results/super', getToken, {
    method: 'POST',
    body: JSON.stringify({ reward, emoji }),
  })
}
