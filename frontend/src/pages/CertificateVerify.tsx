import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { CertificateVerification } from '../types'

export default function CertificateVerify() {
  const { certificateCode } = useParams<{ certificateCode: string }>()
  const [result, setResult] = useState<CertificateVerification | null>(null)

  useEffect(() => {
    api
      .get<CertificateVerification>(`/api/certificates/verify/${certificateCode}`)
      .then((res) => setResult(res.data))
  }, [certificateCode])

  if (!result) return <p className="p-5 text-sm text-slate-500">Verifying…</p>

  if (!result.isValid || !result.certificate) {
    return (
      <div className="px-5 py-12 text-center">
        <h1 className="text-lg font-bold text-red-600 mb-2">Certificate not found</h1>
        <p className="text-sm text-slate-500">No certificate matches code "{certificateCode}".</p>
      </div>
    )
  }

  const cert = result.certificate

  return (
    <div className="px-5 py-12 text-center">
      <div className="inline-block bg-accent/15 text-accent text-xs font-semibold px-3 py-1 rounded-full mb-4">
        ✓ Verified
      </div>
      <h1 className="text-lg font-bold mb-1">{cert.studentName}</h1>
      <p className="text-sm text-brand mb-1">{cert.moduleTitle}</p>
      <p className="text-xs text-slate-500">
        Issued {new Date(cert.issuedAt).toLocaleDateString()} · {cert.certificateCode}
      </p>
    </div>
  )
}
