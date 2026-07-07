import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

interface EnrollmentInfo {
  moduleId: string
  expiresAt: string
}

interface EnrollmentContextValue {
  enrolledModuleIds: string[]
  expiredModuleIds: string[]
  isEnrolled: (moduleId: string) => boolean
  isExpired: (moduleId: string) => boolean
  getExpiresAt: (moduleId: string) => Date | null
  enroll: (moduleId: string) => Promise<void>
  redeemPromo: (code: string, moduleId: string) => Promise<string>
  refresh: () => Promise<void>
  isLoading: boolean
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null)

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEnrollments([]); setIsLoading(false); return }
    api.get<EnrollmentInfo[]>('/api/enrollments/mine')
      .then((res) => setEnrollments(res.data))
      .finally(() => setIsLoading(false))
  }, [user])

  const now = new Date()
  const activeEnrollments = enrollments.filter(e => new Date(e.expiresAt) > now)
  const expiredEnrollments = enrollments.filter(e => new Date(e.expiresAt) <= now)

  const enrolledModuleIds = activeEnrollments.map(e => e.moduleId)
  const expiredModuleIds = expiredEnrollments.map(e => e.moduleId)

  function isEnrolled(moduleId: string) {
    return enrolledModuleIds.includes(moduleId)
  }

  function isExpired(moduleId: string) {
    return expiredModuleIds.includes(moduleId)
  }

  function getExpiresAt(moduleId: string): Date | null {
    const e = enrollments.find(e => e.moduleId === moduleId)
    return e ? new Date(e.expiresAt) : null
  }

  async function enroll(moduleId: string) {
    await api.post('/api/enrollments/dummy-purchase', { moduleId })
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    setEnrollments((prev) => [...prev.filter(e => e.moduleId !== moduleId), { moduleId, expiresAt }])
  }

  async function redeemPromo(code: string, moduleId: string): Promise<string> {
    const res = await api.post<{ message: string }>('/api/enrollments/redeem', { code, moduleId })
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    setEnrollments((prev) => prev.find(e => e.moduleId === moduleId) ? prev : [...prev, { moduleId, expiresAt }])
    return res.data.message
  }

  async function refresh() {
    const res = await api.get<EnrollmentInfo[]>('/api/enrollments/mine')
    setEnrollments(res.data)
  }

  return (
    <EnrollmentContext.Provider value={{ enrolledModuleIds, expiredModuleIds, isEnrolled, isExpired, getExpiresAt, enroll, redeemPromo, refresh, isLoading }}>
      {children}
    </EnrollmentContext.Provider>
  )
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext)
  if (!ctx) throw new Error('useEnrollment must be used within EnrollmentProvider')
  return ctx
}
