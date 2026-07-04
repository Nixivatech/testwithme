import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-lg mx-auto">
        <div className="inline-block bg-brand/20 text-brand-light text-[11px] font-medium px-3 py-1 rounded-full border border-brand/30 mb-5">
          Built for Aspiring QA Engineers
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
          Become a <span className="text-brand-light">QA Pro</span> with Mathilens
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md mx-auto">
          Structured notes, hands-on practice & progress tracking — everything you need to go from zero to hired.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login" className="bg-brand text-white font-semibold py-3.5 px-8 rounded-xl">
            Start Learning Free →
          </Link>
          <Link to="/pricing" className="text-sm text-slate-300 border border-white/20 py-3.5 px-8 rounded-xl hover:bg-white/5 transition-colors">
            See pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
