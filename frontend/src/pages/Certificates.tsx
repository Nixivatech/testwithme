import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Certificate } from '../types'
import CertificateCard from '../components/CertificateCard'

export default function Certificates() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    api.get<Certificate[]>('/api/certificates/mine').then((res) => setCertificates(res.data)).finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Certificates</h1>
          <p className="text-sm text-slate-400 mt-1">Complete a module to earn a shareable certificate.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => <div key={n} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            {isAdmin ? (
              <div>
                <p className="text-sm text-slate-400 mb-6">No certificates issued yet. Here's the certificate design preview:</p>
                <CertificateCard
                  studentName={user?.name ?? 'Student Name'}
                  moduleTitle="Java for Tester"
                  issuedAt={new Date().toISOString()}
                  certificateCode="ML-PREVIEW"
                  preview
                />
              </div>
            ) : (
              <>
                <p className="text-6xl mb-4">🏆</p>
                <p className="text-sm text-slate-400 mb-4">No certificates yet. Finish a module to earn your first one!</p>
                <Link to="/dashboard" className="inline-block text-xs font-semibold text-brand-light border border-brand/30 px-5 py-2.5 rounded-lg hover:bg-brand/10 transition-colors">
                  Go to Modules →
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {certificates.map((c) => (
              <div key={c.certificateCode} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-xl">🏆</div>
                <div>
                  <p className="font-semibold text-sm text-white">{c.moduleTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued {new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <Link
                  to={`/verify/${c.certificateCode}`}
                  className="inline-block text-[11px] font-semibold text-brand-light bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors self-start"
                >
                  {c.certificateCode} — Verify →
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
