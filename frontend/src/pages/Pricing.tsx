import { Link } from 'react-router-dom'

const FREE_FEATURES = ['Access to 2 modules', 'Progress tracking', 'Basic certificate']
const PRO_FEATURES = ['All modules unlocked', 'Premium verified certificate', 'Interview Q&A bank', 'Priority support']

export default function Pricing() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Simple. Affordable. Fair.</h1>
          <p className="text-sm text-slate-400 mt-2">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Side-by-side on sm+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg text-white">Free</p>
              <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">Forever</span>
            </div>
            <p className="text-4xl font-bold mb-1">₹0</p>
            <p className="text-xs text-slate-500 mb-5">No credit card needed</p>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="text-accent text-xs font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block text-center py-3 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-brand/10 border-2 border-brand rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand/15 rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg text-white">Pro</p>
              <span className="text-[10px] font-semibold bg-brand/30 text-brand-light px-2.5 py-1 rounded-full border border-brand/30">Best Value</span>
            </div>
            <p className="text-4xl font-bold mb-1">₹499</p>
            <p className="text-xs text-slate-400 mb-5">per month · Cancel anytime</p>
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                  <span className="text-brand-light text-xs font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block text-center bg-brand text-white text-sm font-semibold py-3 rounded-xl hover:bg-brand/90 transition-colors">
              Get Early Access →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
