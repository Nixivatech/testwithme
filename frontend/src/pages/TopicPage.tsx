import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { TopicDetail } from '../types'

export default function TopicPage() {
  const { moduleSlug, topicSlug } = useParams<{ moduleSlug: string; topicSlug: string }>()
  const [topic, setTopic] = useState<TopicDetail | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [certificateCode, setCertificateCode] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<TopicDetail>(`/api/modules/${moduleSlug}/topics/${topicSlug}`)
      .then((res) => setTopic(res.data))
  }, [moduleSlug, topicSlug])

  async function handleComplete() {
    if (!topic) return
    setIsCompleting(true)
    try {
      const res = await api.post('/api/progress/complete', { topicId: topic.id })
      setTopic({ ...topic, isCompleted: true })
      if (res.data.certificateIssued) {
        setCertificateCode(res.data.certificateCode)
      }
    } finally {
      setIsCompleting(false)
    }
  }

  if (!topic) return <p className="p-5 text-sm text-slate-500">Loading…</p>

  return (
    <div className="px-5 py-6">
      <p className="text-xs text-brand font-semibold mb-1">{topic.moduleTitle}</p>
      <h1 className="text-xl font-bold mb-4">{topic.title}</h1>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">{topic.content}</div>

      {certificateCode && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          🎉 Module complete! Certificate <strong>{certificateCode}</strong> issued.
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={topic.isCompleted || isCompleting}
        className="bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
      >
        {topic.isCompleted ? 'Completed ✓' : isCompleting ? 'Saving…' : 'Mark as complete'}
      </button>
    </div>
  )
}
