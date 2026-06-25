import { config } from './config'

export type SpinResult = {
  userId: string
  spinId: string
  reward: string
  emoji: string
  createdAt: string
  durationMs?: number
  speed?: number
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
