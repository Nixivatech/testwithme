import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

interface EnrollmentContextValue {
  enrolledModuleIds: string[]
  isEnrolled: (moduleId: string) => boolean
  enroll: (moduleId: string) => Promise<void>
  redeemPromo: (code: string, moduleId: string) => Promise<string>
  isLoading: boolean
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null)

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [enrolledModuleIds, setEnrolledModuleIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEnrolledModuleIds([]); setIsLoading(false); return }
    api.get<string[]>('/api/enrollments/mine')
      .then((res) => setEnrolledModuleIds(res.data))
      .finally(() => setIsLoading(false))
  }, [user])

  function isEnrolled(moduleId: string) {
    return enrolledModuleIds.includes(moduleId)
  }

  async function enroll(moduleId: string) {
    await api.post('/api/enrollments/dummy-purchase', { moduleId })
    setEnrolledModuleIds((prev) => [...prev, moduleId])
  }

  async function redeemPromo(code: string, moduleId: string): Promise<string> {
    const res = await api.post<{ message: string }>('/api/enrollments/redeem', { code, moduleId })
    setEnrolledModuleIds((prev) => prev.includes(moduleId) ? prev : [...prev, moduleId])
    return res.data.message
  }

  return (
    <EnrollmentContext.Provider value={{ enrolledModuleIds, isEnrolled, enroll, redeemPromo, isLoading }}>
      {children}
    </EnrollmentContext.Provider>
  )
}

export function useEnrollment() {
  const ctx = useContext(EnrollmentContext)
  if (!ctx) throw new Error('useEnrollment must be used within EnrollmentProvider')
  return ctx
}
