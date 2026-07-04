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

  if (!module) return <p className="p-5 text-sm text-slate-500">Loading…</p>

  return (
    <div className="px-5 py-6">
      <h1 className="text-xl font-bold mb-1">{module.title}</h1>
      <p className="text-sm text-slate-500 mb-5">{module.description}</p>
      <div className="space-y-2">
        {module.topics.map((t) => (
          <Link
            key={t.id}
            to={`/modules/${moduleSlug}/topics/${t.slug}`}
            className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3"
          >
            <span className="text-sm">{t.title}</span>
            {t.isCompleted && <span className="text-accent text-xs font-semibold">✓ Done</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
