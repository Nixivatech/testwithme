import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    const renderButton = () => {
      if (!window.google || !ref.current) return false

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          await loginWithGoogleIdToken(response.credential)
          navigate('/dashboard')
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

  return <div ref={ref} />
}
