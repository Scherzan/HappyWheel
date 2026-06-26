import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from './authContext'

type Status = { kind: 'ok' | 'err'; text: string } | null

function Note({ status }: { status: Status }) {
  if (!status) return null
  return (
    <p className={status.kind === 'ok' ? 'account-ok' : 'auth-error'}>
      {status.text}
    </p>
  )
}

export function Account() {
  const { updateName, updateEmail, verifyEmail, changePassword, getAttributes } =
    useAuth()

  const [name, setName] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')

  // Load current attributes once.
  useEffect(() => {
    getAttributes()
      .then((attrs) => {
        setName(attrs.name ?? '')
        setCurrentEmail(attrs.email ?? '')
      })
      .catch(() => {})
  }, [getAttributes])

  return (
    <div className="panel account-panel">
      <h2>Account</h2>
      <NameSection name={name} setName={setName} updateName={updateName} />
      <EmailSection
        currentEmail={currentEmail}
        updateEmail={updateEmail}
        verifyEmail={verifyEmail}
        onVerified={(e) => setCurrentEmail(e)}
      />
      <PasswordSection changePassword={changePassword} />
    </div>
  )
}

function NameSection({
  name,
  setName,
  updateName,
}: {
  name: string
  setName: (v: string) => void
  updateName: (name: string) => Promise<void>
}) {
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await updateName(name)
      setStatus({ kind: 'ok', text: 'Name updated.' })
    } catch (err) {
      setStatus({ kind: 'err', text: msg(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="account-section" onSubmit={submit}>
      <h3>Name</h3>
      <div className="field">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="account-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
      <Note status={status} />
    </form>
  )
}

function EmailSection({
  currentEmail,
  updateEmail,
  verifyEmail,
  onVerified,
}: {
  currentEmail: string
  updateEmail: (email: string) => Promise<void>
  verifyEmail: (code: string) => Promise<void>
  onVerified: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  // Prefill with the current email, like the Name field.
  useEffect(() => {
    setEmail(currentEmail)
  }, [currentEmail])

  const requestChange = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await updateEmail(email)
      setVerifying(true)
      setStatus({ kind: 'ok', text: `Code sent to ${email}. Enter it below.` })
    } catch (err) {
      setStatus({ kind: 'err', text: msg(err) })
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await verifyEmail(code)
      onVerified(email)
      setVerifying(false)
      setCode('')
      setEmail('')
      setStatus({ kind: 'ok', text: 'Email updated. Use it to sign in next time.' })
    } catch (err) {
      setStatus({ kind: 'err', text: msg(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-section">
      <h3>Email</h3>
      {!verifying ? (
        <form onSubmit={requestChange}>
          <div className="field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="account-btn" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={confirm}>
          <div className="field">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Verification code"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" className="account-btn" disabled={busy}>
              {busy ? 'Verifying…' : 'Confirm'}
            </button>
          </div>
        </form>
      )}
      <Note status={status} />
    </div>
  )
}

function PasswordSection({
  changePassword,
}: {
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
}) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await changePassword(oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      setStatus({ kind: 'ok', text: 'Password changed.' })
    } catch (err) {
      setStatus({ kind: 'err', text: msg(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="account-section" onSubmit={submit}>
      <h3>Password</h3>
      <input
        type="password"
        placeholder="Current password"
        value={oldPassword}
        autoComplete="current-password"
        required
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        autoComplete="new-password"
        required
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button type="submit" className="account-btn self-end" disabled={busy}>
        {busy ? 'Saving…' : 'Change password'}
      </button>
      <Note status={status} />
    </form>
  )
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}
