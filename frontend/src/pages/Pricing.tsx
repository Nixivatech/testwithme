import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <div className="px-5 py-8">
      <h1 className="text-xl font-bold mb-5 text-center">Simple. Affordable. Fair.</h1>
      <div className="space-y-3 max-w-sm mx-auto">
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="font-bold text-base mb-1">Free</p>
          <p className="text-2xl font-bold mb-3">
            ₹0 <span className="text-sm font-normal text-slate-500">/ forever</span>
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>Access to 2 modules</li>
            <li>Progress tracking</li>
            <li>Basic certificate</li>
          </ul>
        </div>
        <div className="rounded-xl border-2 border-brand p-5">
          <p className="font-bold text-base mb-1">Pro</p>
          <p className="text-2xl font-bold mb-3">
            ₹499 <span className="text-sm font-normal text-slate-500">/ month</span>
          </p>
          <ul className="text-sm text-slate-600 space-y-1 mb-4">
            <li>All modules unlocked</li>
            <li>Premium verified certificate</li>
            <li>Interview Q&A bank</li>
            <li>Priority support</li>
          </ul>
          <Link to="/login" className="block text-center bg-brand text-white text-sm font-semibold py-2.5 rounded-lg">
            Get Early Access
          </Link>
        </div>
      </div>
    </div>
  )
}
