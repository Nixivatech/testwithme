import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useEnrollment } from '../context/EnrollmentContext'
import type { ModuleSummary } from '../types'

const HOW_IT_WORKS = [
  { icon: '📚', title: 'Pick a Module', desc: 'Choose a QA topic you want to master from the modules below.' },
  { icon: '✏️', title: 'Learn & Practice', desc: 'Work through each topic at your own pace and mark them complete.' },
  { icon: '🏆', title: 'Earn a Certificate', desc: 'Finish all topics in a module to unlock a shareable certificate.' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { isEnrolled } = useEnrollment()
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get<ModuleSummary[]>('/api/modules').then((res) => setModules(res.data)).finally(() => setIsLoading(false))
  }, [])

  const totalTopics = modules.reduce((sum, m) => sum + m.topicCount, 0)
  const completedTopics = modules.reduce((sum, m) => sum + m.completedTopicCount, 0)
  const overallPct = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

  return (
    <div className="min-h-screen bg-navy text-white">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-12 text-center">
          <div className="inline-block bg-brand/20 text-brand-light text-[11px] font-semibold px-3 py-1 rounded-full border border-brand/30 mb-4 tracking-wide">
            QA Learning Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Welcome to <span className="text-brand-light">Mathilens!</span>
          </h1>
          {user?.name && (
            <p className="text-base font-medium text-slate-400 mt-1">
              Hey, {user.name.split(' ')[0]} 👋
            </p>
          )}
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mt-3">
            Your structured path from beginner to QA professional. Learn real-world testing skills, track your progress, and land your first QA job.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-brand/90 active:scale-95 transition-all"
            >
              Find Topics to Learn
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            {completedTopics > 0 && (
              <Link
                to="/test"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/15 active:scale-95 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Take Test
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Overall progress */}
        {!isLoading && totalTopics > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400">Overall Progress</p>
              <p className="text-xs text-slate-500">{completedTopics}/{totalTopics} topics</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-[11px] text-slate-500">Keep going — you're doing great!</p>
              <p className="text-sm font-bold text-brand-light">{overallPct}%</p>
            </div>
          </div>
        )}

        {/* How it works — 3 columns on desktop */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">How it works</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className="flex lg:flex-col items-start lg:items-center lg:text-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand/30 transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-brand/20 flex items-center justify-center text-xl">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-0.5">{step.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modules — 2 columns on desktop */}
        <div id="modules">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Learning Modules</p>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-28 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-sm text-slate-400">No modules yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {modules.map((m) => {
                const pct = m.topicCount === 0 ? 0 : Math.round((m.completedTopicCount / m.topicCount) * 100)
                const isComplete = pct === 100 && m.topicCount > 0
                const isStarted = m.completedTopicCount > 0 && !isComplete
                return (
                  <Link
                    key={m.id}
                    to={`/modules/${m.slug}`}
                    className="flex flex-col bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand/50 hover:bg-brand/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-brand-light transition-colors">
                        {m.title}
                      </h3>
                      <div className="flex gap-1.5 flex-shrink-0 ml-2">
                        {isComplete && <span className="text-[10px] font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full">Done ✓</span>}
                        {isStarted && <span className="text-[10px] font-semibold bg-brand/20 text-brand-light px-2 py-0.5 rounded-full">In Progress</span>}
                        {m.price != null && isEnrolled(m.id) && (
                          <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Enrolled</span>
                        )}
                        {m.isPro && !m.price && <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full">Pro</span>}
                      </div>
                    </div>
                    {m.description && <p className="text-xs text-slate-400 mb-3 leading-relaxed flex-1">{m.description}</p>}
                    <div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1.5 text-[10px] text-slate-500">{m.completedTopicCount}/{m.topicCount} topics · {pct}%</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
