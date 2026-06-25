import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'
import { config } from './config'
import { AuthContext, type AuthUser } from './authContext'

const userPool = new CognitoUserPool({
  UserPoolId: config.userPoolId,
  ClientId: config.clientId,
})

function cognitoUser(email: string): CognitoUser {
  return new CognitoUser({ Username: email, Pool: userPool })
}

// Resolve the current session, transparently refreshing expired tokens.
function currentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve, reject) => {
    const u = userPool.getCurrentUser()
    if (!u) return resolve(null)
    u.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) return reject(err)
      resolve(session)
    })
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore any persisted session on first load.
  useEffect(() => {
    currentSession()
      .then((session) => {
        if (session?.isValid()) {
          const email = session.getIdToken().payload.email as string
          setUser({ email })
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const signUp = useCallback((email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      userPool.signUp(
        email,
        password,
        [new CognitoUserAttribute({ Name: 'email', Value: email })],
        [],
        (err) => (err ? reject(err) : resolve()),
      )
    })
  }, [])

  const confirmSignUp = useCallback((email: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      cognitoUser(email).confirmRegistration(code, true, (err) =>
        err ? reject(err) : resolve(),
      )
    })
  }, [])

  const signIn = useCallback((email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      cognitoUser(email).authenticateUser(
        new AuthenticationDetails({ Username: email, Password: password }),
        {
          onSuccess: (session) => {
            setUser({ email: session.getIdToken().payload.email as string })
            resolve()
          },
          onFailure: (err) => reject(err),
        },
      )
    })
  }, [])

  const signOut = useCallback(() => {
    userPool.getCurrentUser()?.signOut()
    setUser(null)
  }, [])

  const getIdToken = useCallback(async () => {
    const session = await currentSession()
    if (!session?.isValid()) throw new Error('Not authenticated')
    return session.getIdToken().getJwtToken()
  }, [])

  const value = useMemo(
    () => ({ user, loading, signUp, confirmSignUp, signIn, signOut, getIdToken }),
    [user, loading, signUp, confirmSignUp, signIn, signOut, getIdToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
