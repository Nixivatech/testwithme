import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { FullTestQuestion, FullTestResult } from '../types'

const OPTIONS = ['A', 'B', 'C', 'D'] as const
type Option = typeof OPTIONS[number]

function optionText(q: FullTestQuestion, label: Option) {
  return { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[label]
}

export default function TestPage() {
  const [questions, setQuestions] = useState<FullTestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, Option>>({})
  const [result, setResult] = useState<FullTestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  useEffect(() => {
    api.get<FullTestQuestion[]>('/api/quiz/full-test')
      .then((res) => setQuestions(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit() {
    if (!allAnswered) return
    setSubmitting(true)
    try {
      const res = await api.post<FullTestResult>('/api/quiz/full-test/submit', {
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      })
      setResult(res.data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  // Group questions by topic for display
  const grouped = questions.reduce<{ topicId: string; topicTitle: string; moduleTitle: string; questions: FullTestQuestion[] }[]>((acc, q) => {
    const existing = acc.find((g) => g.topicId === q.topicId)
    if (existing) { existing.questions.push(q); return acc }
    acc.push({ topicId: q.topicId, topicTitle: q.topicTitle, moduleTitle: q.moduleTitle, questions: [q] })
    return acc
  }, [])

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])
  const answeredCount = Object.keys(answers).length
  const pct = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading your test…</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-lg font-bold text-white mb-2">No questions yet</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">
          Complete at least one topic to unlock the full test. Each topic has 3 questions.
        </p>
        <Link to="/dashboard" className="text-xs text-brand-light hover:underline">← Back to Dashboard</Link>
      </div>
    )
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (result) {
    const scorePct = Math.round((result.totalScore / result.totalQuestions) * 100)
    return (
      <div className="min-h-screen bg-navy text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Score card */}
          <div className={`rounded-2xl border p-6 mb-6 text-center ${scorePct >= 60 ? 'bg-accent/10 border-accent/30' : 'bg-amber-400/10 border-amber-400/30'}`}>
            <div className={`text-6xl font-bold mb-1 ${scorePct >= 60 ? 'text-accent' : 'text-amber-300'}`}>
              {result.totalScore}<span className="text-3xl text-slate-400">/{result.totalQuestions}</span>
            </div>
            <p className={`text-lg font-semibold mb-1 ${scorePct >= 60 ? 'text-accent' : 'text-amber-300'}`}>
              {scorePct}% — {scorePct >= 80 ? 'Excellent!' : scorePct >= 60 ? 'Good job!' : 'Keep practising!'}
            </p>
            <p className="text-xs text-slate-500">
              Taken on {new Date(result.takenAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>

          {/* Topic-wise breakdown */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Breakdown by Topic</p>
          <div className="space-y-3">
            {result.topics.map((topic) => (
              <div key={topic.topicId} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Topic header */}
                <button
                  type="button"
                  onClick={() => setExpandedTopic(expandedTopic === topic.topicId ? null : topic.topicId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${topic.passed ? 'bg-accent/15 text-accent' : 'bg-red-400/15 text-red-400'}`}>
                      {topic.score}/{topic.total}
                    </span>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-white truncate">{topic.topicTitle}</p>
                      <p className="text-[11px] text-slate-500">{topic.moduleTitle}</p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`flex-shrink-0 ml-2 text-slate-500 transition-transform ${expandedTopic === topic.topicId ? 'rotate-90' : ''}`}>
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Questions breakdown */}
                {expandedTopic === topic.topicId && (
                  <div className="border-t border-white/10 divide-y divide-white/5">
                    {topic.questions.map((q, qi) => (
                      <div key={q.questionId} className="px-4 py-3">
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${q.isCorrect ? 'bg-accent text-white' : 'bg-red-400 text-white'}`}>
                            {q.isCorrect ? '✓' : '✗'}
                          </span>
                          <p className="text-xs text-slate-200">Q{qi + 1}. {q.text}</p>
                        </div>
                        <div className="ml-7 flex flex-wrap gap-2 text-[11px]">
                          <span className={`px-2 py-0.5 rounded ${q.isCorrect ? 'bg-accent/10 text-accent' : 'bg-red-400/10 text-red-400'}`}>
                            Your answer: {q.yourAnswer || '—'}
                          </span>
                          {!q.isCorrect && (
                            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">
                              Correct: {q.correctAnswer}
                            </span>
                          )}
                        </div>
                        {q.explanation && !q.isCorrect && (
                          <p className="ml-7 mt-2 text-[11px] text-slate-400 leading-relaxed">{q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setResult(null); setAnswers({}) }}
              className="flex-1 bg-white/5 border border-white/10 text-sm font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Retake Test
            </button>
            <Link to="/dashboard" className="flex-1 bg-brand text-white text-sm font-semibold py-3 rounded-xl hover:bg-brand/90 transition-colors text-center">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Full Test</h1>
          <p className="text-sm text-slate-400 mt-1">
            {questions.length} questions from {grouped.length} completed {grouped.length === 1 ? 'topic' : 'topics'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Answered</span>
              <span>{answeredCount} / {questions.length}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Questions grouped by topic */}
        <div className="space-y-8">
          {grouped.map((group, gi) => {
            const groupOffset = grouped.slice(0, gi).reduce((s, g) => s + g.questions.length, 0)
            return (
              <div key={group.topicId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{group.moduleTitle}</p>
                    <p className="text-xs font-semibold text-slate-300">{group.topicTitle}</p>
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-4">
                  {group.questions.map((q, qi) => (
                    <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="text-sm font-semibold text-white mb-4">
                        <span className="text-brand-light mr-2">Q{groupOffset + qi + 1}.</span>{q.text}
                      </p>
                      <div className="space-y-2">
                        {OPTIONS.map((label) => {
                          const selected = answers[q.id] === label
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: label }))}
                              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                                selected
                                  ? 'border-brand bg-brand/10 text-white'
                                  : 'border-white/10 text-slate-300 hover:border-brand/40 hover:bg-brand/5'
                              }`}
                            >
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
                                selected ? 'border-brand bg-brand text-white' : 'border-white/20 text-slate-500'
                              }`}>
                                {label}
                              </span>
                              {optionText(q, label)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit */}
        <div className="mt-8 sticky bottom-6">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="w-full bg-brand text-white text-sm font-semibold py-4 rounded-xl hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
          >
            {submitting
              ? 'Submitting…'
              : allAnswered
              ? `Submit Test — ${questions.length} Questions`
              : `Answer ${questions.length - answeredCount} more to submit`}
          </button>
        </div>

      </div>
    </div>
  )
}
