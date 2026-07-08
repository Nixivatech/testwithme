import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useEnrollment } from '../context/EnrollmentContext'
import { useAuth } from '../context/AuthContext'
import type { ModuleSummary } from '../types'
import CertificateCard from '../components/CertificateCard'

type Section = 'active-users' | 'total-users' | 'new-users' | 'premium-users' | 'free-users' | 'expiring-users' | 'expired-users' | 'promo-code' | 'new-module' | 'dev-tools' | 'existing-modules' | 'price-views' | 'cert-preview'

const MENU: { id: Section; label: string; icon: string }[] = [
  { id: 'active-users',      label: 'Active Users',     icon: '🟢' },
  { id: 'total-users',       label: 'Total Users',      icon: '👥' },
  { id: 'new-users',         label: 'New Users',        icon: '🆕' },
  { id: 'premium-users',     label: 'Premium Users',    icon: '👑' },
  { id: 'free-users',        label: 'Free Users',       icon: '🎓' },
  { id: 'expiring-users',    label: 'Expiring Soon',    icon: '⏳' },
  { id: 'expired-users',     label: 'Expired',          icon: '🔴' },
  { id: 'price-views',       label: 'Price Visited',    icon: '👁️' },
  { id: 'promo-code',        label: 'Promo Code',       icon: '🎟️' },
  { id: 'new-module',        label: 'New Module',       icon: '➕' },
  { id: 'dev-tools',         label: 'Dev Tools',        icon: '🛠️' },
  { id: 'existing-modules',  label: 'Existing Modules', icon: '📚' },
  { id: 'cert-preview',      label: 'Certificate',      icon: '🏅' },
]

interface PriceViewEntry {
  id: string; viewedAt: string
  userName: string; userEmail: string; userAvatarUrl: string | null; userLastSeenAt: string | null
  moduleTitle: string; modulePrice: number
}

interface ActiveUser {
  id: string; name: string; email: string
  avatarUrl: string | null; professional: string | null; lastSeenAt: string
}

interface TotalUser {
  id: string; name: string; email: string; avatarUrl: string | null
  phone: string | null; professional: string | null; role: string
  isProMember: boolean; createdAt: string; lastSeenAt: string | null
}

interface PromoCode {
  id: string; code: string; moduleId: string | null
  maxUses: number; usedCount: number; isActive: boolean; createdAt: string
}

function getTodayCode() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `ML${yy}${dd}${mm}`
}

function Avatar({ url, name, size = 8 }: { url: string | null; name: string; size?: number }) {
  return url
    ? <img src={url} alt={name} className={`w-${size} h-${size} rounded-full flex-shrink-0`} />
    : <div className={`w-${size} h-${size} rounded-full bg-brand/30 flex items-center justify-center text-xs font-bold text-brand flex-shrink-0`}>{name[0]}</div>
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

function UserTable({ users, title, subtitle, filename, onRoleChange }: { users: TotalUser[]; title: string; subtitle?: string; filename: string; onRoleChange?: (id: string, newRole: string) => Promise<void> }) {
  function exportCsv() {
    const rows = [['Name','Email','Mobile','Role','Joined'], ...users.map(u => [u.name, u.email, u.phone ?? '', u.role === 'Admin' ? 'Admin' : u.professional ?? '', new Date(u.createdAt).toLocaleDateString('en-IN')])]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = filename; a.click()
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-bold">{title} <span className="text-slate-500 font-normal text-sm">({users.length}{subtitle ? ' · ' + subtitle : ''})</span></h2>
        {users.length > 0 && (
          <div className="flex gap-2">
            <button type="button" onClick={() => navigator.clipboard.writeText(users.map(u => u.email).join(', '))}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-colors">
              <CopyIcon /> Copy Emails
            </button>
            <button type="button" onClick={exportCsv}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
              Export CSV
            </button>
          </div>
        )}
      </div>
      {users.length === 0 ? <p className="text-sm text-slate-500">No users found.</p> : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Name','Email ID','Mobile','Role','Joined','Last Seen', ...(onRoleChange ? ['Access'] : [])].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar url={u.avatarUrl} name={u.name} size={7} />
                      <span className="text-white font-medium truncate">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 min-w-0 group">
                      <div className="text-slate-400 truncate" title={u.email}>{u.email}</div>
                      <button type="button" onClick={() => navigator.clipboard.writeText(u.email)} className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity" title="Copy email"><CopyIcon /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3"><div className="text-slate-400 truncate">{u.phone ?? <span className="text-slate-600">—</span>}</div></td>
                  <td className="px-4 py-3">
                    {u.role === 'Admin'
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">Admin</span>
                      : u.professional
                        ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300" title={u.professional}>
                            {u.professional === 'Student' ? 'S' : u.professional === 'Working Professional' ? 'W' : 'L'}
                          </span>
                        : <span className="text-slate-600 text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : <span className="text-slate-600">—</span>}
                  </td>
                  {onRoleChange && (
                    <td className="px-4 py-3">
                      {u.role === 'Admin'
                        ? <button type="button" onClick={() => onRoleChange(u.id, 'Student')}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                            Remove Admin
                          </button>
                        : <button type="button" onClick={() => onRoleChange(u.id, 'Admin')}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors whitespace-nowrap">
                            Make Admin
                          </button>
                      }
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { refresh: refreshEnrollments } = useEnrollment()
  const { user } = useAuth()
  const [section, setSection] = useState<Section>('active-users')

  // Active users
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  // Total users
  const [totalUsers, setTotalUsers] = useState<TotalUser[]>([])
  // New users (last 7 days)
  const [newUsers, setNewUsers] = useState<TotalUser[]>([])
  // Premium / Free users
  const [premiumUsers, setPremiumUsers] = useState<TotalUser[]>([])
  const [freeUsers, setFreeUsers] = useState<TotalUser[]>([])
  // Expiring / Expired users
  const [expiringUsers, setExpiringUsers] = useState<TotalUser[]>([])
  const [expiredUsers, setExpiredUsers] = useState<TotalUser[]>([])
  // Price views
  const [priceViews, setPriceViews] = useState<PriceViewEntry[]>([])
  // Modules
  const [modules, setModules] = useState<ModuleSummary[]>([])
  // Promos
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoModuleId, setPromoModuleId] = useState('')
  const [promoMaxUses, setPromoMaxUses] = useState('1')
  const [promoSubmitting, setPromoSubmitting] = useState(false)
  // New module form
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [price, setPrice] = useState('')
  const [features, setFeatures] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Dev tools
  const [flushing, setFlushing] = useState(false)
  const [flushUsers, setFlushUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [userFilter, setUserFilter] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click-outside for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load data on section change
  useEffect(() => {
    if (section === 'active-users') {
      loadActiveUsers()
      const id = setInterval(loadActiveUsers, 30_000)
      return () => clearInterval(id)
    }
    if (section === 'total-users') loadTotalUsers()
    if (section === 'new-users') loadNewUsers()
    if (section === 'premium-users') loadPremiumUsers()
    if (section === 'free-users') loadFreeUsers()
    if (section === 'expiring-users') loadExpiringUsers()
    if (section === 'expired-users') loadExpiredUsers()
    if (section === 'price-views') loadPriceViews()
    if (section === 'promo-code') { loadPromos(); loadModules() }
    if (section === 'new-module') loadModules()
    if (section === 'dev-tools') loadFlushUsers()
    if (section === 'existing-modules') loadModules()
  }, [section])

  function loadActiveUsers() {
    api.get<ActiveUser[]>('/api/admin/active-users').then((r) => setActiveUsers(r.data)).catch(() => {})
  }
  function loadTotalUsers() {
    api.get<TotalUser[]>('/api/admin/users').then((r) => setTotalUsers(r.data)).catch(() => {})
  }
  function loadNewUsers() {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    api.get<TotalUser[]>('/api/admin/users').then((r) => setNewUsers(r.data.filter(u => new Date(u.createdAt).getTime() >= cutoff))).catch(() => {})
  }
  function loadPremiumUsers() {
    api.get<TotalUser[]>('/api/admin/premium-users').then((r) => setPremiumUsers(r.data)).catch(() => {})
  }
  function loadFreeUsers() {
    api.get<TotalUser[]>('/api/admin/free-users').then((r) => setFreeUsers(r.data)).catch(() => {})
  }
  function loadExpiringUsers() {
    api.get<TotalUser[]>('/api/admin/expiring-users').then((r) => setExpiringUsers(r.data)).catch(() => {})
  }
  function loadExpiredUsers() {
    api.get<TotalUser[]>('/api/admin/expired-users').then((r) => setExpiredUsers(r.data)).catch(() => {})
  }
  function loadModules() {
    api.get<ModuleSummary[]>('/api/modules').then((r) => setModules(r.data)).catch(() => {})
  }
  function loadPromos() {
    api.get<PromoCode[]>('/api/promos').then((r) => setPromos(r.data)).catch(() => {})
  }
  function loadFlushUsers() {
    api.get<{ id: string; name: string; email: string }[]>('/api/admin/users').then((r) => setFlushUsers(r.data)).catch(() => {})
  }
  function loadPriceViews() {
    api.get<PriceViewEntry[]>('/api/admin/price-views').then((r) => setPriceViews(r.data)).catch(() => {})
  }

  // Promo
  async function handleCreatePromo(e: FormEvent) {
    e.preventDefault()
    if (!promoCode.trim()) return
    setPromoSubmitting(true)
    try {
      await api.post('/api/promos', { code: promoCode.trim().toUpperCase(), moduleId: promoModuleId || null, maxUses: parseInt(promoMaxUses) || 1 })
      setPromoCode(''); setPromoModuleId(''); setPromoMaxUses('1')
      loadPromos()
    } finally { setPromoSubmitting(false) }
  }

  // Module
  async function handleCreateModule(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/modules', { slug, title, description, orderIndex: modules.length, isPro, isPublished: true, price: price ? parseFloat(price) : null, features: features.trim() || null })
      setSlug(''); setTitle(''); setDescription(''); setIsPro(false); setPrice(''); setFeatures('')
      loadModules()
    } finally { setIsSubmitting(false) }
  }

  // Dev tools
  const filteredUsers = flushUsers.filter((u) =>
    u.email.toLowerCase().includes(userFilter.toLowerCase()) || u.name.toLowerCase().includes(userFilter.toLowerCase())
  )
  function toggleUser(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }
  function toggleSelectAll() {
    setSelectedIds(selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? [] : filteredUsers.map((u) => u.id))
  }
  async function handleFlushUserData() {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Clear data for ${selectedIds.length} user(s)? Their accounts are kept.`)) return
    setFlushing(true)
    try {
      const res = await api.delete<{ message: string }>('/api/admin/flush-user-data', { data: { userIds: selectedIds } })
      alert(res.data.message)
      setSelectedIds([]); loadFlushUsers(); refreshEnrollments()
    } catch { alert('Flush failed.') }
    finally { setFlushing(false) }
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-row gap-6">

        {/* Sidebar */}
        <aside className="w-40 flex-shrink-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 px-1">Admin</p>
          <nav className="flex flex-col gap-1">
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  section === item.id
                    ? 'bg-brand/15 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              to="/learnsphere"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="text-base leading-none">🌐</span>
              LearnSphere
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* Active Users */}
          {section === 'active-users' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-lg font-bold">Active Users <span className="text-slate-500 font-normal text-sm">({activeUsers.length})</span></h2>
                <span className="text-xs text-slate-500 ml-1">last 5 min · auto-refreshes</span>
              </div>
              {activeUsers.length === 0 ? (
                <p className="text-sm text-slate-500">No users active right now.</p>
              ) : (
                <div className="space-y-2">
                  {activeUsers.map((u) => {
                    const seenSec = Math.floor((Date.now() - new Date(u.lastSeenAt).getTime()) / 1000)
                    const seenLabel = seenSec < 60 ? `${seenSec}s ago` : `${Math.floor(seenSec / 60)}m ago`
                    return (
                      <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                        <Avatar url={u.avatarUrl} name={u.name} size={8} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {u.professional && <p className="text-xs text-slate-400">{u.professional}</p>}
                          <p className="text-xs text-green-400">{seenLabel}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Total Users */}
          {section === 'total-users' && (
            <UserTable
              users={totalUsers}
              title="Total Users"
              filename="total-users.csv"
              onRoleChange={async (id, newRole) => {
                await api.patch(`/api/admin/users/${id}/role`, { role: newRole })
                loadTotalUsers()
              }}
            />
          )}

          {/* New Users */}
          {section === 'new-users' && <UserTable users={newUsers} title="New Users" subtitle="last 7 days" filename="new-users.csv" />}

          {/* Premium Users */}
          {section === 'premium-users' && <UserTable users={premiumUsers} title="Premium Users" filename="premium-users.csv" />}

          {/* Free Users */}
          {section === 'free-users' && <UserTable users={freeUsers} title="Free Users" filename="free-users.csv" />}

          {/* Expiring Soon */}
          {section === 'expiring-users' && <UserTable users={expiringUsers} title="Expiring Soon" subtitle="access ends within 15 days" filename="expiring-users.csv" />}

          {/* Expired */}
          {section === 'expired-users' && <UserTable users={expiredUsers} title="Expired Users" subtitle="3-month access ended" filename="expired-users.csv" />}

          {/* Price Visited Users */}
          {section === 'price-views' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Price Visited Users <span className="text-slate-500 font-normal text-sm">({priceViews.length})</span></h2>
              {priceViews.length === 0 ? (
                <p className="text-sm text-slate-500">No price page visits yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        {['User', 'Email', 'Module', 'Price', 'Last Seen', 'Visited At'].map(h => (
                          <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {priceViews.map((v, i) => (
                        <tr key={v.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === priceViews.length - 1 ? 'border-b-0' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar url={v.userAvatarUrl} name={v.userName} size={7} />
                              <span className="text-white font-medium truncate">{v.userName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 group">
                              <span className="text-slate-400 truncate text-xs">{v.userEmail}</span>
                              <button type="button" onClick={() => navigator.clipboard.writeText(v.userEmail)} className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity"><CopyIcon /></button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{v.moduleTitle}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-brand-light">₹{v.modulePrice}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {v.userLastSeenAt ? new Date(v.userLastSeenAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(v.viewedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Promo Code */}
          {section === 'promo-code' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Promo / Referral Codes</h2>
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Today's code (auto-rotates daily)</p>
                  <p className="text-2xl font-mono font-bold text-white tracking-widest">{getTodayCode()}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Format: ML + YY + DD + MM · Share with anyone to grant free access</p>
                </div>
                <div className="text-3xl select-none">🎟️</div>
              </div>
              <form onSubmit={handleCreatePromo} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 space-y-3">
                <p className="text-sm font-semibold text-slate-300 mb-1">New Promo Code</p>
                <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. LAUNCH2024)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-brand uppercase tracking-widest" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Module (optional)</label>
                    <select value={promoModuleId} onChange={(e) => setPromoModuleId(e.target.value)} className="w-full bg-[#1a2235] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
                      <option value="">Any module</option>
                      {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Max uses</label>
                    <input type="number" min="1" value={promoMaxUses} onChange={(e) => setPromoMaxUses(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" />
                  </div>
                </div>
                <button type="submit" disabled={promoSubmitting} className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors">
                  {promoSubmitting ? 'Creating…' : 'Create Promo Code'}
                </button>
              </form>
              {promos.length > 0 && (
                <div className="space-y-2">
                  {promos.map((p) => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white tracking-widest">{p.code}</p>
                        <p className="text-xs text-slate-500">{p.moduleId ? (modules.find((m) => m.id === p.moduleId)?.title ?? 'Unknown') : 'Any module'} · {p.usedCount}/{p.maxUses} used</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.isActive ? 'bg-accent/10 text-accent' : 'bg-white/10 text-slate-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Module */}
          {section === 'new-module' && (
            <div>
              <h2 className="text-lg font-bold mb-4">New Module</h2>
              <form onSubmit={handleCreateModule} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module title (e.g. Java for Testers)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand" />
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (e.g. java-for-testers)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price (₹)</label>
                    <input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave blank = free" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand" />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                      <input type="checkbox" checked={isPro} onChange={(e) => setIsPro(e.target.checked)} className="w-4 h-4 accent-brand" />
                      Requires Pro plan
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Features (one per line)</label>
                  <textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"Progress tracking\nMCQ for each module\nInterview Questions\nCertificate"} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand resize-none font-mono" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand/90 disabled:opacity-50 transition-colors">
                  {isSubmitting ? 'Creating…' : 'Create Module'}
                </button>
              </form>
            </div>
          )}

          {/* Dev Tools */}
          {section === 'dev-tools' && (
            <div>
              <h2 className="text-lg font-bold mb-1">Dev Tools</h2>
              <p className="text-sm text-slate-500 mb-4">Clear user data for testing. Accounts are preserved.</p>
              <div className="border border-red-500/20 rounded-2xl p-5">
                <div className="relative mb-3" ref={dropdownRef}>
                  <button type="button" onClick={() => { setDropdownOpen((o) => !o); loadFlushUsers() }} className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:border-white/20 transition-colors">
                    <span className="text-slate-300">{selectedIds.length === 0 ? 'Select users…' : `${selectedIds.length} user${selectedIds.length > 1 ? 's' : ''} selected`}</span>
                    <span className="text-slate-500 text-xs">{dropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-[#1a2235] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-white/10">
                        <input autoFocus type="text" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter by name or email…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand" />
                      </div>
                      <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer border-b border-white/10">
                        <input type="checkbox" checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length} onChange={toggleSelectAll} className="w-4 h-4 accent-brand" />
                        <span className="text-sm font-semibold text-slate-300">Select All ({filteredUsers.length})</span>
                      </label>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredUsers.length === 0
                          ? <p className="text-xs text-slate-500 px-4 py-3">No users found.</p>
                          : filteredUsers.map((u) => (
                            <label key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer">
                              <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleUser(u.id)} className="w-4 h-4 accent-brand flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{u.name}</p>
                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                              </div>
                            </label>
                          ))
                        }
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <button type="button" onClick={() => setDropdownOpen(false)} className="w-full text-xs text-slate-400 hover:text-white py-1 transition-colors">Done</button>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={handleFlushUserData} disabled={flushing || selectedIds.length === 0} className="bg-red-600/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  {flushing ? 'Flushing…' : `Flush Data${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
                </button>
              </div>
            </div>
          )}

          {/* Existing Modules */}
          {section === 'existing-modules' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Existing Modules <span className="text-slate-500 font-normal text-sm">({modules.length})</span></h2>
              {modules.length === 0
                ? <p className="text-sm text-slate-500">No modules yet.</p>
                : (
                  <div className="space-y-2">
                    {modules.map((m) => (
                      <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{m.title}</p>
                          <p className="text-xs text-slate-500">/{m.slug} · {m.topicCount} topics</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {m.price != null && <span className="text-xs font-semibold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full">₹{m.price}</span>}
                          {m.isPro && <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Pro</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* Certificate Preview */}
          {section === 'cert-preview' && (
            <div>
              <h2 className="text-lg font-bold mb-1">Certificate Preview</h2>
              <p className="text-sm text-slate-400 mb-6">This is how the certificate looks when a user completes the module.</p>
              <CertificateCard
                studentName={user?.name ?? 'Student Name'}
                moduleTitle="Java for Tester"
                issuedAt={new Date().toISOString()}
                certificateCode="ML-PREVIEW"
                preview
              />
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
