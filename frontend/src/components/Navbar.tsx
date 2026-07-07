import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Logo({ to, onClick }: { to: string; onClick?: () => void }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" onClick={onClick}>
      <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="7.5" cy="7.5" r="5" stroke="white" strokeWidth="2" />
          <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="7.5" cy="7.5" r="2.2" fill="white" opacity="0.45" />
        </svg>
      </div>
      <span className="font-bold text-[15px] tracking-tight text-white">
        Mathi<span className="text-brand-light">lens</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
    setMobileOpen(false)
    setProfileOpen(false)
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="bg-navy border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Logo to={user ? '/dashboard' : '/'} onClick={closeMobile} />

        {/* Desktop links */}
        {user ? (
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">
              Dashboard
            </Link>
            <Link to="/certificates" className="text-slate-300 hover:text-white text-sm transition-colors">
              Certificates
            </Link>
            {user.role === 'Admin' && (
              <Link to="/admin" className="text-slate-300 hover:text-white text-sm transition-colors">
                Admin
              </Link>
            )}

            {/* Profile dropdown */}
            <div className="relative pl-4 border-l border-white/10" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full ring-2 ring-brand/40" />
                  : <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center text-xs font-bold text-brand">{user.name[0]}</div>
                }
                <span className="text-sm text-slate-300 hidden md:block">{user.name.split(' ')[0]}</span>
                <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1a2235] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/pricing" className="text-slate-300 hover:text-white text-sm transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
              Sign in
            </Link>
          </div>
        )}

        {/* Hamburger */}
        <button
          className="sm:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5 w-5">
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/10 bg-navy px-6 py-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-white/10">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                  : <div className="w-10 h-10 rounded-full bg-brand/30 flex items-center justify-center text-sm font-bold text-brand">{user.name[0]}</div>
                }
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <Link to="/dashboard" onClick={closeMobile} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Dashboard</Link>
                <Link to="/certificates" onClick={closeMobile} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Certificates</Link>
                <Link to="/profile" onClick={closeMobile} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">View Profile</Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" onClick={closeMobile} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Admin</Link>
                )}
              </div>
              <button onClick={handleLogout} className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/pricing" onClick={closeMobile} className="block text-center py-2.5 rounded-xl text-sm text-slate-300 border border-white/10 hover:bg-white/5 transition-colors">Pricing</Link>
              <Link to="/login" onClick={closeMobile} className="block text-center bg-brand text-white text-sm font-semibold py-2.5 rounded-xl">Sign in</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
