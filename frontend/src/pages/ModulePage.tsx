import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useEnrollment } from '../context/EnrollmentContext'
import type { ModuleDetail } from '../types'

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const navigate = useNavigate()
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const { user } = useAuth()
  const { isEnrolled, isExpired, getExpiresAt, enroll, redeemPromo, isLoading: enrollmentLoading } = useEnrollment()
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  useEffect(() => {
    api.get<ModuleDetail>(`/api/modules/${moduleSlug}`).then((res) => setModule(res.data))
  }, [moduleSlug])

  useEffect(() => {
    if (!module || enrollmentLoading) return
    if (module.price != null && !isEnrolled(module.id)) {
      api.post('/api/price-views', { moduleId: module.id }).catch(() => {})
    }
    const pending = sessionStorage.getItem('pendingPurchase')
    if (pending === module.id && user?.phone) {
      sessionStorage.removeItem('pendingPurchase')
      handleDummyPurchase()
    }
  }, [module?.id, enrollmentLoading])

  if (!module || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  const isPaid = module.price != null
  const expired = isExpired(module.id)
  const expiresAt = getExpiresAt(module.id)
  const hasAccess = (!isPaid || isEnrolled(module.id) || purchased) && !expired
  const completedCount = module.topics.filter((t) => t.isCompleted).length
  const pct = module.topics.length === 0 ? 0 : Math.round((completedCount / module.topics.length) * 100)
  const featureList = module.features ? module.features.split('\n').filter(Boolean) : []

  const hasTopics = module.topics.length > 0
  const notStarted = hasAccess && hasTopics && completedCount === 0
  const inProgress = hasAccess && hasTopics && completedCount > 0 && completedCount < module.topics.length
  const isCompleted = hasAccess && hasTopics && completedCount === module.topics.length
  const firstTopic = module.topics[0]
  const nextTopic = module.topics.find((t) => !t.isCompleted) ?? firstTopic
  const ctaLabel = isCompleted ? 'View Certificate' : inProgress ? 'Resume Learning' : 'Start Learning'
  const ctaTo = isCompleted ? '/certificates' : `/modules/${moduleSlug}/topics/${nextTopic?.slug}`

  async function handleDummyPurchase() {
    if (!user?.phone) {
      const go = window.confirm('Phone number is mandatory before purchasing.\n\nClick OK to complete your profile.')
      if (go) {
        sessionStorage.setItem('pendingPurchase', module!.id)
        navigate(`/profile?redirect=/modules/${moduleSlug}`)
      }
      return
    }
    setPurchasing(true)
    try {
      await enroll(module!.id)
      setPurchased(true)
    } finally {
      setPurchasing(false)
    }
  }

  async function handleRedeemPromo(e: React.FormEvent) {
    e.preventDefault()
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoSuccess('')
    try {
      const msg = await redeemPromo(promoCode.trim(), module!.id)
      setPromoSuccess(msg)
      setPurchased(true)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPromoError(message ?? 'Invalid promo code. Please try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  const backLink = (
    <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back to Dashboard
    </Link>
  )

  /* ── LOCKED / NO ACCESS ── centered purchase layout ── */
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-navy text-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {backLink}

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{expired ? '⏰' : '🔒'}</div>
            <h1 className="text-2xl font-bold text-white">{module.title}</h1>
            {module.description && (
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{module.description}</p>
            )}
          </div>

          <div className="bg-brand/10 border-2 border-brand rounded-2xl p-6">
            {expired ? (
              <p className="text-sm text-slate-400 text-center mb-5">
                Your 3-month access ended. Renew to continue learning.
              </p>
            ) : (
              <p className="text-sm text-slate-400 text-center mb-5">
                One-time payment · 3 months access
              </p>
            )}

            {featureList.length > 0 && (
              <ul className="space-y-2.5 mb-6">
                {featureList.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="text-brand-light font-bold flex-shrink-0">✓</span>
                    {f.trim()}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={handleDummyPurchase}
              disabled={purchasing}
              className="w-full bg-brand text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60"
            >
              {purchasing ? 'Processing…' : `Buy Now · ₹${module.price}`}
            </button>

            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setPromoOpen((v) => !v)}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 mx-auto"
              >
                <span>{promoOpen ? '▾' : '▸'}</span> Have a referral / promo code?
              </button>
              {promoOpen && (
                <form onSubmit={handleRedeemPromo} className="mt-3 flex gap-2 max-w-xs mx-auto">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-brand uppercase tracking-widest"
                  />
                  <button
                    type="submit"
                    disabled={promoLoading || !promoCode.trim()}
                    className="bg-accent text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
                  >
                    {promoLoading ? '…' : 'Apply'}
                  </button>
                </form>
              )}
              {promoError && <p className="text-[11px] text-red-400 mt-2 text-center">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-accent mt-2 text-center">{promoSuccess}</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── HAS ACCESS ── sidebar + topics layout ── */
  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {backLink}

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* Left: compact info */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <h1 className="text-2xl font-bold text-white mb-1">{module.title}</h1>
              {module.description && (
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{module.description}</p>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">

                {expiresAt && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>⏳</span> Access until {expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}

                {hasTopics && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs text-slate-400">Progress</p>
                      <p className="text-xs font-semibold text-brand-light">{pct}%</p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{completedCount}/{module.topics.length} topics</p>
                  </div>
                )}

                {hasTopics ? (
                  <Link
                    to={ctaTo}
                    className={`flex items-center justify-center gap-2 w-full text-sm font-semibold py-3 rounded-xl transition-all active:scale-95 ${
                      isCompleted
                        ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30'
                        : 'bg-brand text-white hover:bg-brand/90'
                    }`}
                  >
                    {ctaLabel}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                    <span className="text-accent text-sm">✓</span>
                    <p className="text-xs font-semibold text-accent">You have access</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: topic list */}
          <div className="lg:col-span-2 space-y-2">

            {purchased && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-accent">🎉</span>
                <p className="text-sm text-accent font-medium">You now have full access!</p>
              </div>
            )}

            {hasTopics && (
              <div className={`rounded-xl px-4 py-3 border ${
                isCompleted ? 'bg-amber-400/10 border-amber-400/20'
                : notStarted ? 'bg-brand/10 border-brand/20'
                : 'bg-white/5 border-white/10'
              }`}>
                {isCompleted && <p className="text-sm font-semibold text-amber-300">Module complete! 🏆</p>}
                {inProgress && <p className="text-sm font-semibold text-white">Completed — {completedCount}/{module.topics.length}</p>}
                {notStarted && <p className="text-sm font-semibold text-white">{purchased ? 'Ready to begin your learning journey?' : 'Start your first topic below.'}</p>}
              </div>
            )}

            {module.topics.map((t, i) => {
              const isLocked = i > 0 && !module.topics[i - 1].isCompleted
              if (isLocked) {
                return (
                  <div key={t.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 cursor-not-allowed">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white/10 text-slate-400">{i + 1}</div>
                    <span className="text-sm font-semibold text-white flex-1">{t.title}</span>
                    <span className="text-slate-500 text-sm flex-shrink-0">🔒</span>
                  </div>
                )
              }
              return (
                <Link
                  key={t.id}
                  to={`/modules/${moduleSlug}/topics/${t.slug}`}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-brand/40 hover:bg-brand/5 transition-all group"
                >
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${t.isCompleted ? 'bg-accent text-white' : 'bg-white/10 text-slate-400 group-hover:bg-brand/20 group-hover:text-brand-light'}`}>
                    {t.isCompleted ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors flex-1">{t.title}</span>
                  {!t.isCompleted && nextTopic?.slug === t.slug && !isCompleted && (
                    <span className="text-[10px] font-semibold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      {notStarted ? 'Start here' : 'Next up'}
                    </span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-600 group-hover:text-slate-400 flex-shrink-0">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
