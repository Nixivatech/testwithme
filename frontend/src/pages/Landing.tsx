import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="bg-navy text-white px-5 py-12 text-center">
      <div className="inline-block bg-brand/20 text-brand-light text-[11px] font-medium px-3 py-1 rounded-full border border-brand/30 mb-5">
        Built for Aspiring QA Engineers
      </div>
      <h1 className="text-3xl font-bold leading-tight mb-3">
        Become a <span className="text-brand-light">QA Testing Pro</span>
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed mb-7 max-w-md mx-auto">
        Structured notes, hands-on practice & progress tracking — everything you need to go from zero to hired.
      </p>
      <Link
        to="/login"
        className="block w-full max-w-xs mx-auto bg-brand text-white font-semibold py-3.5 rounded-xl mb-3"
      >
        Start Learning Free →
      </Link>
      <Link to="/pricing" className="text-sm text-slate-400 underline">
        See pricing
      </Link>
    </div>
  )
}
