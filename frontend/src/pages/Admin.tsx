import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../lib/api'
import type { ModuleSummary } from '../types'

export default function Admin() {
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPro, setIsPro] = useState(false)

  function loadModules() {
    api.get<ModuleSummary[]>('/api/modules').then((res) => setModules(res.data))
  }

  useEffect(() => {
    loadModules()
  }, [])

  async function handleCreateModule(e: FormEvent) {
    e.preventDefault()
    await api.post('/api/modules', {
      slug,
      title,
      description,
      orderIndex: modules.length,
      isPro,
      isPublished: true,
    })
    setSlug('')
    setTitle('')
    setDescription('')
    setIsPro(false)
    loadModules()
  }

  return (
    <div className="px-5 py-6">
      <h1 className="text-xl font-bold mb-4">Admin · Modules</h1>

      <form onSubmit={handleCreateModule} className="space-y-2 mb-6 border border-slate-200 rounded-xl p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title"
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (e.g. selenium)"
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isPro} onChange={(e) => setIsPro(e.target.checked)} />
          Requires Pro plan
        </label>
        <button type="submit" className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Create module
        </button>
      </form>

      <div className="space-y-2">
        {modules.map((m) => (
          <div key={m.id} className="border border-slate-200 rounded-lg px-4 py-3 text-sm">
            {m.title} <span className="text-slate-400">/{m.slug}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
