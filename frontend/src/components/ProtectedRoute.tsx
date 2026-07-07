import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!user.isProfileComplete && pathname !== '/complete-profile') return <Navigate to="/complete-profile" replace />
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
