import { useState, type FormEvent } from 'react'
import { useAuth } from './authContext'

// Invite-only: accounts are created by an admin (aws cognito-idp admin-create-user),
// so the UI only offers sign-in.
export function AuthForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Sign in</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        autoComplete="email"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        autoComplete="current-password"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? 'Please wait…' : 'Sign in'}
      </button>
    </form>
  )
}
