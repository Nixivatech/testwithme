import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { ModuleSummary } from '../types'

const HOW_IT_WORKS = [
  {
    icon: '📚',
    title: 'Pick a Module',
    desc: 'Choose a QA topic you want to master from the modules below.',
  },
  {
    icon: '✏️',
    title: 'Learn & Practice',
    desc: 'Work through each topic at your own pace and mark them complete as you go.',
  },
  {
    icon: '🏆',
    title: 'Earn a Certificate',
    desc: 'Finish all topics in a module to unlock a shareable certificate of completion.',
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<ModuleSummary[]>('/api/modules')
      .then((res) => setModules(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  const totalTopics = modules.reduce((sum, m) => sum + m.topicCount, 0)
  const completedTopics = modules.reduce((sum, m) => sum + m.completedTopicCount, 0)
  const overallPct = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

  return (
    <div className="min-h-screen bg-navy text-white">

      {/* Hero */}
      <div className="relative px-5 pt-10 pb-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-block bg-brand/20 text-brand-light text-[11px] font-semibold px-3 py-1 rounded-full border border-brand/30 mb-4 tracking-wide">
            QA Learning Platform
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Welcome to <span className="text-brand-light">Mathilens!</span>
          </h1>
          {user?.name && (
            <p className="text-base font-medium text-slate-400 mt-1">
              Hey, {user.name.split(' ')[0]} 👋
            </p>
          )}
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto mt-3">
            Your structured path from beginner to QA professional. Learn real-world testing skills, track your progress, and land your first QA job.
          </p>
        </div>
      </div>

      {/* Overall progress */}
      {!isLoading && totalTopics > 0 && (
        <div className="mx-5 mb-8 bg-white/5 border border-white/10 rounded-2xl p-4">
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

      {/* How it works */}
      <div className="px-5 mb-8">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          How it works
        </p>
        <div className="space-y-2.5">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand/30 transition-colors"
            >
              <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-brand/20 flex items-center justify-center text-lg">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
              <span className="text-4xl font-black text-white/5 self-center leading-none flex-shrink-0">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="px-5 pb-12">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Learning Modules
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-sm text-slate-400">No modules yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((m) => {
              const pct = m.topicCount === 0 ? 0 : Math.round((m.completedTopicCount / m.topicCount) * 100)
              const isComplete = pct === 100 && m.topicCount > 0
              const isStarted = m.completedTopicCount > 0 && !isComplete

              return (
                <Link
                  key={m.id}
                  to={`/modules/${m.slug}`}
                  className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-brand/50 hover:bg-brand/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-white group-hover:text-brand-light transition-colors">
                      {m.title}
                    </h3>
                    <div className="flex gap-1.5 flex-shrink-0 ml-2">
                      {isComplete && (
                        <span className="text-[10px] font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                          Completed ✓
                        </span>
                      )}
                      {isStarted && (
                        <span className="text-[10px] font-semibold bg-brand/20 text-brand-light px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                      {m.isPro && (
                        <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full">
                          Pro
                        </span>
                      )}
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{m.description}</p>
                  )}

                  <div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-500">
                      {m.completedTopicCount}/{m.topicCount} topics · {pct}%
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
