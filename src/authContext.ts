import { createContext, useContext } from 'react'

export type AuthUser = { email: string }

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  getIdToken: () => Promise<string>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
