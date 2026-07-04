import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Certificate } from '../types'

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .get<Certificate[]>('/api/certificates/mine')
      .then((res) => setCertificates(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-5 py-7 max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-1">Your Certificates</h1>
        <p className="text-sm text-slate-400 mb-6">Complete a module to earn a shareable certificate.</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-sm text-slate-400">
              No certificates yet. Finish a module to earn your first one!
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 text-xs font-semibold text-brand-light border border-brand/30 px-4 py-2 rounded-lg hover:bg-brand/10 transition-colors"
            >
              Go to Modules →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((c) => (
              <div
                key={c.certificateCode}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{c.moduleTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued {new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <Link
                    to={`/verify/${c.certificateCode}`}
                    className="inline-block mt-2 text-[11px] font-semibold text-brand-light bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full hover:bg-brand/20 transition-colors"
                  >
                    {c.certificateCode} — Verify →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
