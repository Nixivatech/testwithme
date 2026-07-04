import { Link } from 'react-router-dom'

const FREE_FEATURES = ['Access to 2 modules', 'Progress tracking', 'Basic certificate']
const PRO_FEATURES = ['All modules unlocked', 'Premium verified certificate', 'Interview Q&A bank', 'Priority support']

export default function Pricing() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-5 py-10 max-w-sm mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Simple. Affordable. Fair.</h1>
          <p className="text-sm text-slate-400 mt-2">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="space-y-4">

          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-base text-white">Free</p>
              <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">Forever</span>
            </div>
            <p className="text-3xl font-bold mb-4">
              ₹0
            </p>
            <ul className="space-y-2 mb-5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-accent text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block text-center py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-brand/10 border-2 border-brand rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-base text-white">Pro</p>
              <span className="text-[10px] font-semibold bg-brand/30 text-brand-light px-2 py-0.5 rounded-full border border-brand/30">
                Best Value
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₹499 <span className="text-base font-normal text-slate-400">/ month</span>
            </p>
            <p className="text-xs text-slate-400 mb-4">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-2 mb-5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="text-brand-light text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block text-center bg-brand text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
            >
              Get Early Access →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
