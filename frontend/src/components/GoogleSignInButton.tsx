import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

export default function GoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null)
  const { loginWithGoogleIdToken } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    const renderButton = () => {
      if (!window.google || !ref.current) return false

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setSigningIn(true)
          try {
            await loginWithGoogleIdToken(response.credential)
            navigate('/dashboard')
          } catch {
            setSigningIn(false)
          }
        },
      })

      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
      })
      return true
    }

    if (renderButton()) return

    const interval = setInterval(() => {
      if (renderButton()) clearInterval(interval)
    }, 100)

    return () => clearInterval(interval)
  }, [loginWithGoogleIdToken, navigate])

  if (signingIn) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Signing you in…</p>
      </div>
    )
  }

  return <div ref={ref} />
}
