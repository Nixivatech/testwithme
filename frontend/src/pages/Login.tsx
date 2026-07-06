import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Login() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="w-full max-w-xs">
        <div className="mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand mx-auto flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2.5" />
              <line x1="18.5" y1="18.5" x2="25" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.5" fill="white" opacity="0.45" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to <span className="text-brand-light">Mathilens</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Sign in to start your QA learning journey and track your progress.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <GoogleSignInButton />
          <p className="text-[11px] text-slate-500 mt-4">
            By signing in, you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  )
}
