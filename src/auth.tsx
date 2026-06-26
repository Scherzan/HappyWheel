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

// A current user with a valid session attached — required before attribute /
// password operations.
function authedUser(): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    const u = userPool.getCurrentUser()
    if (!u) return reject(new Error('Not authenticated'))
    u.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        return reject(err ?? new Error('Session expired'))
      }
      resolve(u)
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

  const getAttributes = useCallback(async () => {
    const u = await authedUser()
    return new Promise<Record<string, string>>((resolve, reject) => {
      u.getUserAttributes((err, attrs) => {
        if (err) return reject(err)
        const map: Record<string, string> = {}
        attrs?.forEach((a) => (map[a.getName()] = a.getValue()))
        resolve(map)
      })
    })
  }, [])

  const updateAttribute = useCallback(async (name: string, value: string) => {
    const u = await authedUser()
    return new Promise<void>((resolve, reject) => {
      u.updateAttributes(
        [new CognitoUserAttribute({ Name: name, Value: value })],
        (err) => (err ? reject(err) : resolve()),
      )
    })
  }, [])

  const updateName = useCallback(
    (name: string) => updateAttribute('name', name),
    [updateAttribute],
  )

  // Changing email re-triggers verification; the new address must be confirmed
  // with verifyEmail before it becomes the sign-in identity.
  const updateEmail = useCallback(
    (email: string) => updateAttribute('email', email),
    [updateAttribute],
  )

  const verifyEmail = useCallback(async (code: string) => {
    const u = await authedUser()
    return new Promise<void>((resolve, reject) => {
      u.verifyAttribute('email', code, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      })
    })
  }, [])

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      const u = await authedUser()
      return new Promise<void>((resolve, reject) => {
        u.changePassword(oldPassword, newPassword, (err) =>
          err ? reject(err) : resolve(),
        )
      })
    },
    [],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      getIdToken,
      getAttributes,
      updateName,
      updateEmail,
      verifyEmail,
      changePassword,
    }),
    [
      user,
      loading,
      signIn,
      signOut,
      getIdToken,
      getAttributes,
      updateName,
      updateEmail,
      verifyEmail,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
