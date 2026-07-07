import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { CertificateVerification } from '../types'
import CertificateCard from '../components/CertificateCard'

export default function CertificateVerify() {
  const { certificateCode } = useParams<{ certificateCode: string }>()
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<CertificateVerification>(`/api/certificates/verify/${certificateCode}`)
      .then((res) => setResult(res.data))
      .finally(() => setLoading(false))
  }, [certificateCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-sm text-slate-500">Verifying certificate…</p>
      </div>
    )
  }

  if (!result?.isValid || !result.certificate) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-center px-6">
        <div>
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-lg font-bold text-red-400 mb-2">Certificate Not Found</h1>
          <p className="text-sm text-slate-500">No certificate matches code "{certificateCode}".</p>
          <Link to="/" className="inline-block mt-6 text-xs text-brand-light hover:underline">← Back to Mathilens</Link>
        </div>
      </div>
    )
  }

  const cert = result.certificate

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6 print:hidden">
          <span className="inline-block bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
            ✓ Verified Certificate
          </span>
          <p className="text-sm text-slate-400 mt-2">This certificate was issued by Mathilens and is authentic.</p>
        </div>

        <CertificateCard
          studentName={cert.studentName}
          moduleTitle={cert.moduleTitle}
          issuedAt={cert.issuedAt}
          certificateCode={cert.certificateCode}
        />

        <p className="text-center text-xs text-slate-600 mt-4 print:hidden">
          Verify at mathilens.com/verify/{cert.certificateCode}
        </p>
      </div>
    </div>
  )
}
