import { useState, type FormEvent } from 'react'
import { useAuth } from './authContext'

type Mode = 'signIn' | 'signUp' | 'confirm'

export function AuthForm() {
  const { signIn, signUp, confirmSignUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signIn') {
        await signIn(email, password)
      } else if (mode === 'signUp') {
        await signUp(email, password)
        setMode('confirm') // Cognito emails a verification code
      } else {
        await confirmSignUp(email, code)
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>
        {mode === 'signIn'
          ? 'Sign in'
          : mode === 'signUp'
            ? 'Create account'
            : 'Confirm your email'}
      </h2>

      {mode !== 'confirm' && (
        <>
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
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}

      {mode === 'confirm' && (
        <input
          type="text"
          inputMode="numeric"
          placeholder="Verification code"
          value={code}
          required
          onChange={(e) => setCode(e.target.value)}
        />
      )}

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={busy}>
        {busy
          ? 'Please wait…'
          : mode === 'signIn'
            ? 'Sign in'
            : mode === 'signUp'
              ? 'Sign up'
              : 'Confirm'}
      </button>

      {mode === 'signIn' && (
        <button type="button" className="link" onClick={() => setMode('signUp')}>
          Need an account? Sign up
        </button>
      )}
      {mode === 'signUp' && (
        <button type="button" className="link" onClick={() => setMode('signIn')}>
          Already have an account? Sign in
        </button>
      )}
    </form>
  )
}
