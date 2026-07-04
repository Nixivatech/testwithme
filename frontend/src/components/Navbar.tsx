import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-navy px-5 py-4 flex items-center justify-between border-b border-white/10">
      <Link to="/" className="font-bold text-base">
        <span className="text-[#FF9933]">Test</span>
        <span className="text-white">With</span>
        <span className="text-accent">Me</span>
      </Link>
      {user ? (
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-300 text-sm">
            Dashboard
          </Link>
          <Link to="/certificates" className="text-slate-300 text-sm">
            Certificates
          </Link>
          {user.role === 'Admin' && (
            <Link to="/admin" className="text-slate-300 text-sm">
              Admin
            </Link>
          )}
          <div className="flex items-center gap-2">
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
            )}
            <span className="text-slate-200 text-sm">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-300 text-sm bg-transparent border border-white/10 rounded px-3 py-1">
            Sign out
          </button>
        </div>
      ) : (
        <Link to="/login" className="bg-brand text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg">
          Sign in
        </Link>
      )}
    </nav>
  )
}
