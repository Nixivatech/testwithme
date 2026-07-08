import { useState } from 'react'

const CORRECT_PIN = '2308'

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '')
    setPin(value)
    setError(false)
    if (value.length === CORRECT_PIN.length) {
      if (value === CORRECT_PIN) {
        onUnlock()
      } else {
        setError(true)
        setTimeout(() => setPin(''), 500)
      }
    }
  }

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-xs w-full text-center">
        <h1 className="text-3xl font-bold mb-2">
          Learn<span className="text-brand-light">Sphere</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Enter your PIN to continue</p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={CORRECT_PIN.length}
          value={pin}
          onChange={handleChange}
          placeholder="••••"
          className={`w-full text-center text-xl tracking-[0.5em] bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-white/20 focus:border-brand'}`}
          autoFocus
        />
        {error && <p className="text-xs text-red-400 mt-3">Incorrect PIN. Try again.</p>}
      </div>
    </div>
  )
}

function LearnSphereContent({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-navy text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-end mb-6">
          <button
            onClick={onLogout}
            className="text-xs text-slate-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="text-center mb-16">
          <div className="inline-block bg-brand/20 text-brand-light text-[11px] font-medium px-3 py-1 rounded-full border border-brand/30 mb-5">
            Powered by Mathilens
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Learn<span className="text-brand-light">Sphere</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            A dedicated learning environment built for scale — structured paths, live assessments, and deep analytics for QA learners.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: 'Structured Paths',
              desc: 'Curated learning tracks from beginner to advanced QA, sequenced for maximum retention.',
            },
            {
              title: 'Live Assessments',
              desc: 'Real-time quizzes and scenario-based tests that mirror actual QA interview formats.',
            },
            {
              title: 'Analytics Dashboard',
              desc: 'Track learner progress, completion rates, and weak areas at a glance.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center border border-white/10 rounded-2xl p-10 bg-white/5">
          <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
          <p className="text-slate-400 text-sm">
            LearnSphere is under active development. Stay tuned for the full launch.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LearnSphere() {
  const [unlocked, setUnlocked] = useState(false)

  function handleLogout() {
    setUnlocked(false)
  }

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />
  return <LearnSphereContent onLogout={handleLogout} />
}
