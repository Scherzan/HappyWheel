import { createContext, useContext } from 'react'

export type AuthUser = { email: string }

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  getIdToken: () => Promise<string>
  // Account management
  getAttributes: () => Promise<Record<string, string>>
  updateName: (name: string) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  verifyEmail: (code: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
