import { useEffect, useState } from 'react'
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

  if (isLoading) return <p className="p-5 text-sm text-slate-500">Loading…</p>

  return (
    <div className="px-5 py-6">
      <h1 className="text-xl font-bold mb-4">Your Certificates</h1>
      {certificates.length === 0 && <p className="text-sm text-slate-500">Complete a module to earn your first certificate.</p>}
      <div className="space-y-3">
        {certificates.map((c) => (
          <div key={c.certificateCode} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-sm">{c.moduleTitle}</p>
            <p className="text-xs text-slate-500 mb-2">Issued {new Date(c.issuedAt).toLocaleDateString()}</p>
            <a href={`/verify/${c.certificateCode}`} className="text-xs text-brand underline">
              {c.certificateCode}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
