import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../lib/api'
import type { ModuleSummary } from '../types'

interface PromoCode {
  id: string
  code: string
  moduleId: string | null
  maxUses: number
  usedCount: number
  isActive: boolean
  createdAt: string
}

function getTodayCode() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `ML${yy}${dd}${mm}`
}

export default function Admin() {
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [price, setPrice] = useState('')
  const [features, setFeatures] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [promos, setPromos] = useState<PromoCode[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoModuleId, setPromoModuleId] = useState('')
  const [promoMaxUses, setPromoMaxUses] = useState('1')
  const [promoSubmitting, setPromoSubmitting] = useState(false)
  const [flushing, setFlushing] = useState(false)

  async function handleFlushTestUsers() {
    if (!window.confirm('Delete all non-admin users and their data? This cannot be undone.')) return
    setFlushing(true)
    try {
      const res = await api.delete<{ message: string }>('/api/admin/flush-test-users')
      alert(res.data.message)
    } catch {
      alert('Flush failed.')
    } finally {
      setFlushing(false)
    }
  }

  function loadModules() {
    api.get<ModuleSummary[]>('/api/modules').then((res) => setModules(res.data))
  }

  function loadPromos() {
    api.get<PromoCode[]>('/api/promos').then((res) => setPromos(res.data)).catch(() => {})
  }

  useEffect(() => { loadModules(); loadPromos() }, [])

  async function handleCreatePromo(e: FormEvent) {
    e.preventDefault()
    if (!promoCode.trim()) return
    setPromoSubmitting(true)
    try {
      await api.post('/api/promos', {
        code: promoCode.trim().toUpperCase(),
        moduleId: promoModuleId || null,
        maxUses: parseInt(promoMaxUses) || 1,
      })
      setPromoCode('')
      setPromoModuleId('')
      setPromoMaxUses('1')
      loadPromos()
    } finally {
      setPromoSubmitting(false)
    }
  }

  async function handleCreateModule(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/api/modules', {
        slug,
        title,
        description,
        orderIndex: modules.length,
        isPro,
        isPublished: true,
        price: price ? parseFloat(price) : null,
        features: features.trim() || null,
      })
      setSlug('')
      setTitle('')
      setDescription('')
      setIsPro(false)
      setPrice('')
      setFeatures('')
      loadModules()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <h1 className="text-2xl font-bold mb-6">Admin</h1>

        {/* Promo code section */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Promo / Referral Codes</p>

          {/* Today's dynamic code */}
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
            <div className="grid grid-cols-2 gap-3">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="CODE (e.g. LAUNCH2024)"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-brand uppercase tracking-widest col-span-2"
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1">Module (optional — leave blank for any)</label>
                <select
                  value={promoModuleId}
                  onChange={(e) => setPromoModuleId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                >
                  <option value="">Any module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max uses</label>
                <input
                  type="number"
                  min="1"
                  value={promoMaxUses}
                  onChange={(e) => setPromoMaxUses(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={promoSubmitting}
              className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {promoSubmitting ? 'Creating…' : 'Create Promo Code'}
            </button>
          </form>

          {promos.length > 0 && (
            <div className="space-y-2">
              {promos.map((p) => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-bold text-white tracking-widest">{p.code}</p>
                    <p className="text-xs text-slate-500">
                      {p.moduleId ? (modules.find((m) => m.id === p.moduleId)?.title ?? 'Unknown module') : 'Any module'} · {p.usedCount}/{p.maxUses} used
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-accent/10 text-accent' : 'bg-white/10 text-slate-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create module form */}
        <form onSubmit={handleCreateModule} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-3">
          <p className="text-sm font-semibold text-slate-300 mb-1">New Module</p>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Module title (e.g. Java for Testers)"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug (e.g. java-for-testers)"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 100  (leave blank = free)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPro}
                  onChange={(e) => setIsPro(e.target.checked)}
                  className="w-4 h-4 accent-brand"
                />
                Requires Pro plan
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Features (one per line)
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={"Progress tracking\nMCQ for each module\nInterview Questions\nCertificate"}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand resize-none font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Each line becomes a feature bullet shown on the module card.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating…' : 'Create Module'}
          </button>
        </form>

        {/* Dev tools */}
        <div className="mt-10 mb-8 border border-red-500/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-widest mb-1">Dev Tools</p>
          <p className="text-xs text-slate-500 mb-4">Destructive actions for testing only. Admin accounts are preserved.</p>
          <button
            onClick={handleFlushTestUsers}
            disabled={flushing}
            className="bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {flushing ? 'Flushing…' : 'Flush Test Users'}
          </button>
        </div>

        {/* Existing modules */}
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Existing Modules</p>
        <div className="space-y-2">
          {modules.length === 0 ? (
            <p className="text-sm text-slate-500">No modules yet.</p>
          ) : (
            modules.map((m) => (
              <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.title}</p>
                  <p className="text-xs text-slate-500">/{m.slug} · {m.topicCount} topics</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {m.price != null && (
                    <span className="text-xs font-semibold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full">₹{m.price}</span>
                  )}
                  {m.isPro && (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Pro</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
