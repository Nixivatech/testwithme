import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { lsApi, clearLsToken, getLsToken, setLsToken } from '../lib/lsApi'

export interface LsUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: 'Student' | 'Admin'
  createdAt: string
}

interface LsAuthContextValue {
  user: LsUser | null
  isLoading: boolean
  loginWithGoogleIdToken: (idToken: string) => Promise<void>
  logout: () => void
}

const LsAuthContext = createContext<LsAuthContextValue | null>(null)

export function LsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LsUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!getLsToken()) {
      setIsLoading(false)
      return
    }
    lsApi
      .get<LsUser>('/api/users/me')
      .then((res) => setUser(res.data))
      .catch(() => clearLsToken())
      .finally(() => setIsLoading(false))
  }, [])

  async function loginWithGoogleIdToken(idToken: string) {
    const res = await lsApi.post<{ token: string; user: LsUser }>('/api/auth/google', { idToken })
    setLsToken(res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    clearLsToken()
    setUser(null)
  }

  return (
    <LsAuthContext.Provider value={{ user, isLoading, loginWithGoogleIdToken, logout }}>
      {children}
    </LsAuthContext.Provider>
  )
}

export function useLsAuth() {
  const ctx = useContext(LsAuthContext)
  if (!ctx) throw new Error('useLsAuth must be used within LsAuthProvider')
  return ctx
}
