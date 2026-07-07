import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useEnrollment } from '../context/EnrollmentContext'
import type { ModuleDetail } from '../types'

type Filter = 'all' | 'free' | 'pro'


export default function BrowsePage() {
  const [modules, setModules] = useState<ModuleDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({})
  const { isEnrolled } = useEnrollment()

  useEffect(() => {
    api.get<ModuleDetail[]>('/api/modules/all-details')
      .then((res) => setModules(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = modules.filter((m) => {
    if (filter === 'free') return !m.isPro && m.price == null
    if (filter === 'pro') return m.isPro || m.price != null
    return true
  })

  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0)
  const freeCount = modules.filter((m) => !m.isPro && m.price == null).length

  function toggleTopics(id: string) {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-navy text-white">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Browse All Topics</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLoading ? 'Loading…' : `${totalTopics} topics across ${modules.length} modules · ${freeCount} free`}
          </p>
          <div className="flex gap-2 mt-5">
            {(['all', 'free', 'pro'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filter === f ? 'bg-brand text-white border-brand' : 'text-slate-400 border-white/15 hover:border-white/30 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Modules' : f === 'free' ? 'Free' : 'Paid'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Module cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => <div key={n} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No modules in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {filtered.map((m) => {
              const completedCount = m.topics.filter((t) => t.isCompleted).length
              const pct = m.topics.length === 0 ? 0 : Math.round((completedCount / m.topics.length) * 100)
              const isFree = !m.isPro && m.price == null
              const isPurchased = !isFree && isEnrolled(m.id)
              const showTopics = expandedTopics[m.id] ?? false
              const featureList = m.features ? m.features.split('\n').filter(Boolean) : []

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden ${
                    m.price != null
                      ? 'bg-brand/10 border-2 border-brand'
                      : m.isPro
                      ? 'bg-amber-400/5 border-2 border-amber-400/40'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {/* Decorative circle for paid */}
                  {(m.price != null || m.isPro) && (
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                  )}

                  {/* Title + badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-base text-white leading-snug">{m.title}</h2>
                    {isFree ? (
                      <span className="text-[10px] font-semibold bg-accent/20 text-accent px-2.5 py-1 rounded-full flex-shrink-0">Free</span>
                    ) : isPurchased ? (
                      <span className="text-[10px] font-semibold bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full border border-green-500/30 flex-shrink-0">Enrolled</span>
                    ) : m.price != null ? (
                      <span className="text-[10px] font-semibold bg-brand/30 text-brand-light px-2.5 py-1 rounded-full border border-brand/30 flex-shrink-0">Paid</span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-400 px-2.5 py-1 rounded-full flex-shrink-0">Pro</span>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {isFree ? 'Free' : isPurchased ? 'Enrolled' : m.price != null ? `₹${m.price}` : 'Pro Plan'}
                    </p>
                    {m.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                    )}
                  </div>

                  {/* Features */}
                  {featureList.length > 0 && (
                    <ul className="space-y-2">
                      {featureList.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                          <span className={`text-xs font-bold flex-shrink-0 ${isFree ? 'text-accent' : m.price != null ? 'text-brand-light' : 'text-amber-400'}`}>✓</span>
                          {f.trim()}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Progress */}
                  {m.topics.length > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>{completedCount}/{m.topics.length} topics completed</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Topic list toggle */}
                  {m.topics.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleTopics(m.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
                      >
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className={`transition-transform ${showTopics ? 'rotate-180' : ''}`}
                        >
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {showTopics ? 'Hide topics' : `Show ${m.topics.length} topics`}
                      </button>
                      {showTopics && (
                        <div className="bg-black/20 rounded-xl overflow-hidden">
                          {m.topics.map((t, i) => (
                            <Link
                              key={t.id}
                              to={`/modules/${m.slug}/topics/${t.slug}`}
                              className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                            >
                              <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                                t.isCompleted ? 'bg-accent text-white' : 'bg-white/10 text-slate-500'
                              }`}>
                                {t.isCompleted ? '✓' : i + 1}
                              </div>
                              <span className="text-xs text-slate-300 group-hover:text-white transition-colors flex-1 truncate">{t.title}</span>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-slate-600 group-hover:text-slate-400 flex-shrink-0">
                                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    to={`/modules/${m.slug}`}
                    className={`mt-auto block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      m.price != null
                        ? 'bg-brand text-white hover:bg-brand/90'
                        : m.isPro
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30'
                        : 'border border-white/20 text-white hover:bg-white/5'
                    }`}
                  >
                    {completedCount > 0 ? 'Continue Learning →' : 'Start Learning →'}
                  </Link>
                </div>
              )
            })}
          </div>
        )}


      </div>
    </div>
  )
}
