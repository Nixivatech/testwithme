import { useState } from 'react'
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
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setOpen(false)
  }

  const close = () => setOpen(false)

  return (
    <nav className="bg-navy border-b border-white/10 sticky top-0 z-50">
      {/* Inner constrained to max-w-5xl so it aligns with page content */}
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Logo to={user ? '/dashboard' : '/'} onClick={close} />

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
            <div className="flex items-center gap-2.5 pl-4 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full ring-2 ring-brand/40" />
                )}
                <span className="text-sm text-slate-300 hidden md:block">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white transition-colors ml-1">
                Sign out
              </button>
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
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5 w-5">
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-white rounded transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-navy px-6 py-4">
          {user ? (
            <>
              <Link to="/profile" onClick={close} className="flex items-center gap-3 pb-4 mb-3 border-b border-white/10 hover:opacity-80 transition-opacity">
                {user.avatarUrl && <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />}
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </Link>
              <div className="space-y-0.5">
                <Link to="/dashboard" onClick={close} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Dashboard</Link>
                <Link to="/certificates" onClick={close} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Certificates</Link>
                <Link to="/profile" onClick={close} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Edit Profile</Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" onClick={close} className="flex items-center px-3 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Admin</Link>
                )}
              </div>
              <button onClick={handleLogout} className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/pricing" onClick={close} className="block text-center py-2.5 rounded-xl text-sm text-slate-300 border border-white/10 hover:bg-white/5 transition-colors">Pricing</Link>
              <Link to="/login" onClick={close} className="block text-center bg-brand text-white text-sm font-semibold py-2.5 rounded-xl">Sign in</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
