import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { ModuleDetail } from '../types'

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>()
  const [module, setModule] = useState<ModuleDetail | null>(null)

  useEffect(() => {
    api.get<ModuleDetail>(`/api/modules/${moduleSlug}`).then((res) => setModule(res.data))
  }, [moduleSlug])

  if (!module) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  const completedCount = module.topics.filter((t) => t.isCompleted).length
  const pct = module.topics.length === 0 ? 0 : Math.round((completedCount / module.topics.length) * 100)

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-5 py-7 max-w-2xl mx-auto">

        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{module.title}</h1>
          {module.description && (
            <p className="text-sm text-slate-400 leading-relaxed">{module.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-slate-400">Module Progress</p>
            <p className="text-xs font-semibold text-brand-light">{pct}%</p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {completedCount}/{module.topics.length} topics completed
          </p>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          {module.topics.map((t, i) => (
            <Link
              key={t.id}
              to={`/modules/${moduleSlug}/topics/${t.slug}`}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-brand/40 hover:bg-brand/5 transition-all group"
            >
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                  t.isCompleted
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-slate-400 group-hover:bg-brand/20 group-hover:text-brand-light'
                }`}
              >
                {t.isCompleted ? '✓' : i + 1}
              </div>
              <span className="text-sm text-slate-200 group-hover:text-white transition-colors flex-1">
                {t.title}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-slate-600 group-hover:text-slate-400 flex-shrink-0"
              >
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
