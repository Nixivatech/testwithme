import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

  if (!topic) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-5 py-7 max-w-2xl mx-auto">

        {/* Back */}
        <Link
          to={`/modules/${moduleSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {topic.moduleTitle}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-light uppercase tracking-wider mb-2">
            {topic.moduleTitle}
          </p>
          <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
        </div>

        {/* Certificate banner */}
        {certificateCode && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
            <p className="text-sm font-semibold text-accent mb-0.5">🎉 Module Complete!</p>
            <p className="text-xs text-slate-300">
              Certificate <strong className="text-white">{certificateCode}</strong> has been issued.{' '}
              <Link to="/certificates" className="text-brand-light underline">View your certificates →</Link>
            </p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {topic.content}
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={topic.isCompleted || isCompleting}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
            topic.isCompleted
              ? 'bg-accent/20 text-accent border border-accent/30 cursor-default'
              : 'bg-brand text-white hover:bg-brand/90 active:scale-95'
          }`}
        >
          {topic.isCompleted ? '✓ Completed' : isCompleting ? 'Saving…' : 'Mark as Complete'}
        </button>

      </div>
    </div>
  )
}
