import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import ProgressBar from '../components/ProgressBar'
import type { ModuleSummary } from '../types'

export default function Dashboard() {
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<ModuleSummary[]>('/api/modules')
      .then((res) => setModules(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <p className="p-5 text-sm text-slate-500">Loading modules…</p>

  return (
    <div className="px-5 py-6">
      <h1 className="text-xl font-bold mb-4">Your Modules</h1>
      <div className="space-y-3">
        {modules.map((m) => (
          <Link
            key={m.id}
            to={`/modules/${m.slug}`}
            className="block border border-slate-200 rounded-xl p-4 hover:border-brand"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{m.title}</h3>
              {m.isPro && (
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">{m.description}</p>
            <ProgressBar completed={m.completedTopicCount} total={m.topicCount} />
          </Link>
        ))}
      </div>
    </div>
  )
}
