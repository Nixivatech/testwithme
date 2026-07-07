import { useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function useHeartbeat() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    api.post('/api/users/heartbeat').catch(() => {})
    const id = setInterval(() => {
      api.post('/api/users/heartbeat').catch(() => {})
    }, 30_000)
    return () => clearInterval(id)
  }, [user])
}
