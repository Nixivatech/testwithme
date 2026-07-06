import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Question, QuizResult, QuizSession, TopicDetail } from '../types'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const
type OptionLabel = typeof OPTION_LABELS[number]

function optionText(q: Question, label: OptionLabel) {
  return { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[label]
}

export default function TopicPage() {
  const { moduleSlug, topicSlug } = useParams<{ moduleSlug: string; topicSlug: string }>()
  const [topic, setTopic] = useState<TopicDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, OptionLabel>>({})
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<QuizSession[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTopic(null)
    setQuestions([])
    setAnswers({})
    setQuizResult(null)
    setHistory([])
    setHistoryOpen(false)
    api.get<TopicDetail>(`/api/modules/${moduleSlug}/topics/${topicSlug}`).then((res) => {
      setTopic(res.data)
      api.get<Question[]>(`/api/quiz/topics/${res.data.id}`).then((r) => setQuestions(r.data))
      api.get<QuizSession[]>(`/api/quiz/history/${res.data.id}`).then((r) => setHistory(r.data))
    })
  }, [moduleSlug, topicSlug])

  async function handleSubmitQuiz() {
    if (!topic) return
    const answeredAll = questions.every((q) => answers[q.id])
    if (!answeredAll) return

    setSubmitting(true)
    try {
      const res = await api.post<QuizResult>('/api/quiz/submit', {
        topicId: topic.id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      })
      setQuizResult(res.data)
      setTopic((prev) => prev ? { ...prev, isCompleted: true } : prev)
      // Refresh history to include the new session
      api.get<QuizSession[]>(`/api/quiz/history/${topic.id}`).then((r) => setHistory(r.data))
    } finally {
      setSubmitting(false)
    }
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])
  const isLastTopic = !topic.nextTopicSlug

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <Link to={`/modules/${moduleSlug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {topic.moduleTitle}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-brand-light uppercase tracking-wider">{topic.moduleTitle}</p>
            {topic.totalTopics > 0 && (
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {topic.topicIndex} / {topic.totalTopics}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{topic.title}</h1>
        </div>

        {/* Certificate banner */}
        {quizResult?.certificateCode && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
            <p className="text-sm font-semibold text-accent mb-1">🏆 Module Complete!</p>
            <p className="text-xs text-slate-300 mb-3">
              Certificate <strong className="text-white font-mono">{quizResult.certificateCode}</strong> has been issued.
            </p>
            <Link
              to="/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-4 py-2 rounded-lg transition-colors"
            >
              View your certificates →
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{topic.content}</div>
        </div>

        {/* Quiz section */}
        {questions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {quizResult ? 'Quiz Results' : 'Quick Check — 3 Questions'}
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {quizResult ? (
              /* Results view */
              <div className="space-y-4">
                {/* Score banner */}
                <div className={`rounded-xl border px-5 py-4 flex items-center justify-between ${
                  quizResult.passed
                    ? 'bg-accent/10 border-accent/20'
                    : 'bg-amber-400/10 border-amber-400/20'
                }`}>
                  <div>
                    <p className={`text-base font-bold ${quizResult.passed ? 'text-accent' : 'text-amber-300'}`}>
                      {quizResult.passed ? '✓ Great job!' : 'Keep practising!'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      You got {quizResult.score} out of {quizResult.total} correct
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${quizResult.passed ? 'text-accent' : 'text-amber-300'}`}>
                    {quizResult.score}/{quizResult.total}
                  </div>
                </div>

                {/* Per-question breakdown */}
                {quizResult.results.map((r, i) => (
                  <div key={r.questionId} className={`rounded-xl border p-4 ${r.isCorrect ? 'border-accent/20 bg-accent/5' : 'border-red-400/20 bg-red-400/5'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${r.isCorrect ? 'bg-accent text-white' : 'bg-red-400 text-white'}`}>
                        {r.isCorrect ? '✓' : '✗'}
                      </span>
                      <p className="text-sm font-medium text-white">{r.text}</p>
                    </div>
                    <div className="ml-7 space-y-1 mb-3">
                      {OPTION_LABELS.map((label) => {
                        const isCorrect = label === r.correctAnswer
                        const isYours = label === r.yourAnswer
                        return (
                          <div key={label} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                            isCorrect ? 'bg-accent/10 text-accent font-semibold' :
                            isYours && !isCorrect ? 'bg-red-400/10 text-red-400 line-through' :
                            'text-slate-500'
                          }`}>
                            <span className="font-mono font-bold w-4">{label}.</span>
                            {optionText(questions[i], label)}
                            {isCorrect && <span className="ml-auto text-[10px]">✓ correct</span>}
                            {isYours && !isCorrect && <span className="ml-auto text-[10px]">your answer</span>}
                          </div>
                        )
                      })}
                    </div>
                    {r.explanation && (
                      <div className="ml-7 bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-slate-400 leading-relaxed">{r.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Quiz form */
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">
                      <span className="text-brand-light mr-2">Q{i + 1}.</span>{q.text}
                    </p>
                    <div className="space-y-2">
                      {OPTION_LABELS.map((label) => {
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

                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || submitting}
                  className="w-full bg-brand text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting…' : allAnswered ? 'Submit Quiz' : `Answer all ${questions.length} questions to submit`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz session history */}
        {history.length > 0 && (
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-3"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${historyOpen ? 'rotate-90' : ''}`}>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quiz History — {history.length} {history.length === 1 ? 'attempt' : 'attempts'}
            </button>

            {historyOpen && (
              <div className="space-y-3">
                {history.map((session, si) => (
                  <div key={session.attemptId} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {/* Session header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${session.passed ? 'bg-accent/15 text-accent' : 'bg-red-400/15 text-red-400'}`}>
                          {session.score}/{session.total} {session.passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Attempt #{history.length - si}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(session.attemptedAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true,
                        })}
                      </span>
                    </div>

                    {/* Per-question breakdown */}
                    <div className="divide-y divide-white/5">
                      {session.answers.map((ans, qi) => (
                        <div key={ans.questionId} className="px-4 py-3 flex items-start gap-3">
                          <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${ans.isCorrect ? 'bg-accent text-white' : 'bg-red-400 text-white'}`}>
                            {ans.isCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 mb-1">Q{qi + 1}. {ans.questionText}</p>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              <span className={`px-2 py-0.5 rounded ${ans.isCorrect ? 'bg-accent/10 text-accent' : 'bg-red-400/10 text-red-400'}`}>
                                Your answer: {ans.givenAnswer}
                              </span>
                              {!ans.isCorrect && (
                                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">
                                  Correct: {ans.correctAnswer}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom navigation */}
        <div className="flex items-center gap-3 flex-wrap">
          {topic.prevTopicSlug && (
            <Link
              to={`/modules/${moduleSlug}/topics/${topic.prevTopicSlug}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Previous
            </Link>
          )}

          {topic.isCompleted ? (
            topic.nextTopicSlug ? (
              <Link
                to={`/modules/${moduleSlug}/topics/${topic.nextTopicSlug}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-brand/90 active:scale-95 transition-all"
              >
                Next Topic
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-sm font-semibold px-6 py-3 rounded-xl">
                <span>✓</span> All topics complete!
              </div>
            )
          ) : (
            questions.length === 0 && (
              <button
                onClick={async () => {
                  const res = await api.post('/api/progress/complete', { topicId: topic.id })
                  setTopic({ ...topic, isCompleted: true })
                  if (!isLastTopic && topic.nextTopicSlug) navigate(`/modules/${moduleSlug}/topics/${topic.nextTopicSlug}`)
                  if (res.data.certificateIssued) setQuizResult({ score: 0, total: 0, passed: true, results: [], certificateCode: res.data.certificateCode })
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-brand/90 active:scale-95 transition-all"
              >
                {isLastTopic ? 'Mark as Complete' : 'Mark Complete & Next Topic →'}
              </button>
            )
          )}

          {!topic.isCompleted && !quizResult && topic.nextTopicSlug && questions.length === 0 && (
            <Link
              to={`/modules/${moduleSlug}/topics/${topic.nextTopicSlug}`}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip for now
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
