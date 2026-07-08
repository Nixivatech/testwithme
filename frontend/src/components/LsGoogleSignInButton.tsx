import { useEffect, useRef, useState } from 'react'
import { useLsAuth } from '../context/LsAuthContext'

export default function LsGoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const { loginWithGoogleIdToken } = useLsAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  const loginRef = useRef(loginWithGoogleIdToken)
  loginRef.current = loginWithGoogleIdToken

  useEffect(() => {
    if (initializedRef.current) return

    const renderButton = () => {
      if (!window.google || !ref.current) return false

      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        setError('VITE_GOOGLE_CLIENT_ID is not set in .env.local')
        return true
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        error_callback: (err: { type: string }) => {
          if (err.type === 'popup_closed') {
            setError('Sign-in popup was closed. Please try again.')
          } else if (err.type === 'popup_failed_to_open') {
            setError('Popup was blocked. Please allow popups for this site.')
          } else {
            setError(`Google sign-in error: ${err.type}`)
          }
        },
        callback: async (response: { credential: string }) => {
          setSigningIn(true)
          setError('')
          try {
            await loginRef.current(response.credential)
          } catch (err: unknown) {
            const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            const isNetwork = (err as { code?: string })?.code === 'ERR_NETWORK'
            if (axiosMsg) {
              setError(axiosMsg)
            } else if (isNetwork) {
              setError(`Cannot reach LearnSphere backend at ${import.meta.env.VITE_LS_API_URL ?? 'http://localhost:5020'}. Is the server running?`)
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
        <p className="text-xs text-slate-400">Signing you in to LearnSphere…</p>
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
