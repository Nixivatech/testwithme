import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useEnrollment } from '../context/EnrollmentContext'
import type { ModuleDetail } from '../types'

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const { isEnrolled, enroll, redeemPromo, isLoading: enrollmentLoading } = useEnrollment()
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

  if (!module || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  const isPaid = module.price != null
  const hasAccess = !isPaid || isEnrolled(module.id) || purchased
  const completedCount = module.topics.filter((t) => t.isCompleted).length
  const pct = module.topics.length === 0 ? 0 : Math.round((completedCount / module.topics.length) * 100)
  const featureList = module.features ? module.features.split('\n').filter(Boolean) : []

  // Smart CTA state
  const hasTopics = module.topics.length > 0
  const notStarted = hasAccess && hasTopics && completedCount === 0
  const inProgress = hasAccess && hasTopics && completedCount > 0 && completedCount < module.topics.length
  const isCompleted = hasAccess && hasTopics && completedCount === module.topics.length

  const firstTopic = module.topics[0]
  const nextTopic = module.topics.find((t) => !t.isCompleted) ?? firstTopic

  const ctaLabel = isCompleted
    ? 'View Certificate'
    : inProgress
    ? 'Resume Learning'
    : 'Start Learning'

  const ctaTo = isCompleted
    ? '/certificates'
    : `/modules/${moduleSlug}/topics/${nextTopic?.slug}`

  async function handleDummyPurchase() {
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

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">

          {/* Left: info card */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <h1 className="text-2xl font-bold text-white mb-2">{module.title}</h1>
              {module.description && (
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{module.description}</p>
              )}

              <div className={`rounded-xl p-4 space-y-4 border ${isPaid && !hasAccess ? 'bg-brand/10 border-brand/40' : 'bg-white/5 border-white/10'}`}>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Price</p>
                  {isPaid ? (
                    <span className="text-lg font-bold text-white">₹{module.price}</span>
                  ) : (
                    <span className="text-lg font-bold text-accent">Free</span>
                  )}
                </div>

                {/* Features */}
                {featureList.length > 0 && (
                  <ul className="space-y-1.5">
                    {featureList.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-accent font-bold">✓</span> {f.trim()}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Progress (only if access + topics exist) */}
                {hasAccess && hasTopics && (
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

                {/* CTA or Buy button */}
                {hasAccess ? (
                  hasTopics ? (
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
                  )
                ) : isPaid ? (
                  <button
                    onClick={handleDummyPurchase}
                    disabled={purchasing}
                    className="w-full bg-brand text-white text-sm font-semibold py-3 rounded-xl hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {purchasing ? 'Processing…' : `Buy Now · ₹${module.price}`}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: topics or paywall */}
          <div className="lg:col-span-2">
            {!hasAccess ? (
              /* Paywall */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-lg font-bold text-white mb-2">This module is locked</h2>
                <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
                  Purchase access to unlock all {module.topics.length} topics and start learning.
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto mb-6">
                  {featureList.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-brand-light">✓</span> {f.trim()}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDummyPurchase}
                  disabled={purchasing}
                  className="bg-brand text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60"
                >
                  {purchasing ? 'Processing…' : `Buy Now · ₹${module.price}`}
                </button>
                <p className="text-[11px] text-slate-500 mt-3">3 months access · One-time payment</p>

                {/* Promo code */}
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
                  {promoError && <p className="text-[11px] text-red-400 mt-2">{promoError}</p>}
                  {promoSuccess && <p className="text-[11px] text-accent mt-2">{promoSuccess}</p>}
                </div>
              </div>
            ) : (
              /* Topic list */
              <div className="space-y-2">

                {/* Smart access banner */}
                {purchased && (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-accent">🎉</span>
                      <p className="text-sm text-accent font-medium">You now have full access!</p>
                    </div>
                  </div>
                )}

                {hasTopics && (
                  <div className={`rounded-xl px-4 py-3 mb-2 flex items-center justify-between gap-3 border ${
                    isCompleted
                      ? 'bg-amber-400/10 border-amber-400/20'
                      : notStarted
                      ? 'bg-brand/10 border-brand/20'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div>
                      {isCompleted && <p className="text-sm font-semibold text-amber-300">Module complete! 🏆</p>}
                      {inProgress && (
                        <p className="text-sm font-semibold text-white">
                          Keep going — {completedCount}/{module.topics.length} topics done
                        </p>
                      )}
                      {notStarted && (
                        <p className="text-sm font-semibold text-white">
                          {purchased ? 'Ready to begin your learning journey?' : 'Pick up where you left off or start fresh.'}
                        </p>
                      )}
                    </div>
                    <Link
                      to={ctaTo}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 ${
                        isCompleted
                          ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                          : 'bg-brand text-white hover:bg-brand/90'
                      }`}
                    >
                      {ctaLabel}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                )}

                {module.topics.map((t, i) => (
                  <Link
                    key={t.id}
                    to={`/modules/${moduleSlug}/topics/${t.slug}`}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-brand/40 hover:bg-brand/5 transition-all group"
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${t.isCompleted ? 'bg-accent text-white' : 'bg-white/10 text-slate-400 group-hover:bg-brand/20 group-hover:text-brand-light'}`}>
                      {t.isCompleted ? '✓' : i + 1}
                    </div>
                    <span className="text-sm text-slate-200 group-hover:text-white transition-colors flex-1">{t.title}</span>
                    {!t.isCompleted && nextTopic?.slug === t.slug && !isCompleted && (
                      <span className="text-[10px] font-semibold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        {notStarted ? 'Start here' : 'Next up'}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-600 group-hover:text-slate-400 flex-shrink-0">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
