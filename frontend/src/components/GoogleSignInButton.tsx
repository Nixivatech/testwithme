import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            error_callback?: (error: { type: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

export default function GoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const { loginWithGoogleIdToken } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  // Store the latest callbacks in refs so re-renders don't re-trigger the effect
  const loginRef = useRef(loginWithGoogleIdToken)
  const navigateRef = useRef(navigate)
  loginRef.current = loginWithGoogleIdToken
  navigateRef.current = navigate

  useEffect(() => {
    // Prevent double-initialization from React StrictMode's double-invoke in dev
    if (initializedRef.current) return

    const renderButton = () => {
      if (!window.google || !ref.current) return false

      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        setError('VITE_GOOGLE_CLIENT_ID is not set in .env.local')
        return true
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        error_callback: (err) => {
          console.error('[GoogleSignIn] Google-side error:', err)
          if (err.type === 'popup_closed') {
            setError('Sign-in popup was closed. Please try again.')
          } else if (err.type === 'popup_failed_to_open') {
            setError('Popup was blocked. Please allow popups for this site.')
          } else {
            setError(`Google sign-in error: ${err.type}`)
          }
        },
        callback: async (response) => {
          setSigningIn(true)
          setError('')
          try {
            const { isProfileComplete } = await loginRef.current(response.credential)
            navigateRef.current(isProfileComplete ? '/dashboard' : '/complete-profile')
          } catch (err: unknown) {
            console.error('[GoogleSignIn] Backend auth error:', err)
            const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            const isNetwork = (err as { code?: string })?.code === 'ERR_NETWORK'
            if (axiosMsg) {
              setError(axiosMsg)
            } else if (isNetwork) {
              setError(`Cannot reach backend at ${import.meta.env.VITE_API_URL ?? 'http://localhost:5019'}. Is the server running?`)
            } else if (err instanceof Error) {
              setError(err.message)
            } else {
              setError('Sign-in failed. Please try again.')
            }
            setSigningIn(false)
          }
        },
      })

      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
      })

      initializedRef.current = true
      return true
    }

    if (renderButton()) return

    const interval = setInterval(() => {
      if (renderButton()) clearInterval(interval)
    }, 100)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (signingIn) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Signing you in…</p>
      </div>
    )
  }

  return (
    <div>
      <div ref={ref} />
      {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}
    </div>
  )
}
