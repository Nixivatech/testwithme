interface CertificateCardProps {
  studentName: string
  moduleTitle: string
  issuedAt: string
  certificateCode: string
  preview?: boolean
}

export default function CertificateCard({ studentName, moduleTitle, issuedAt, certificateCode, preview }: CertificateCardProps) {
  const date = new Date(issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Certificate */}
      <div
        id="certificate-print"
        className="relative bg-white w-full max-w-3xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: '1.414 / 1' }}
      >
        {/* Blue top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500" />

        {/* Outer border */}
        <div className="absolute inset-3 border-2 border-blue-500/30 pointer-events-none" />
        {/* Inner border */}
        <div className="absolute inset-5 border border-blue-400/15 pointer-events-none" />

        {/* Corner accents */}
        <CornerMark pos="top-3 left-3" />
        <CornerMark pos="top-3 right-3" flipX />
        <CornerMark pos="bottom-3 left-3" flipY />
        <CornerMark pos="bottom-3 right-3" flipX flipY />

        {/* Background watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]"
          aria-hidden
        >
          <img src="/logo.svg" alt="" style={{ width: '55%', height: '55%', objectFit: 'contain' }} />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-between px-14 py-9 text-center">

          {/* Header: Logo + name */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Mathilens" style={{ width: 28, height: 28 }} />
              <span className="text-blue-600 font-bold tracking-[0.15em] uppercase" style={{ fontSize: '0.8rem' }}>Mathilens</span>
            </div>
            <p className="text-slate-400" style={{ fontSize: '0.62rem', letterSpacing: '0.2em' }}>LEARN. EXECUTE. FIND.</p>
          </div>

          {/* Main */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-500 font-semibold tracking-[0.3em] uppercase" style={{ fontSize: '0.65rem' }}>
                Certificate of Completion
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px w-14 bg-blue-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div className="h-px w-14 bg-blue-400" />
              </div>
            </div>

            <p className="text-slate-400 font-light tracking-wider" style={{ fontSize: '0.7rem' }}>
              This is to certify that
            </p>

            <p
              className="text-slate-800 font-bold leading-tight"
              style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', fontFamily: 'Georgia, serif' }}
            >
              {studentName}
            </p>

            <p className="text-slate-400 font-light tracking-wider" style={{ fontSize: '0.7rem' }}>
              has successfully completed the course
            </p>

            <div className="flex flex-col items-center gap-1.5">
              <p
                className="text-blue-600 font-bold leading-tight"
                style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.45rem)' }}
              >
                {moduleTitle}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-px w-10 bg-blue-300" />
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <div className="h-px w-10 bg-blue-300" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
            <div className="text-left">
              <p className="text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontSize: '0.58rem' }}>Date Issued</p>
              <div className="h-px w-28 bg-slate-200 mb-1" />
              <p className="text-slate-600 font-semibold" style={{ fontSize: '0.7rem' }}>{date}</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center">
                <img src="/logo.svg" alt="ML" style={{ width: 22, height: 22 }} />
              </div>
              <p className="text-blue-400 tracking-widest uppercase" style={{ fontSize: '0.55rem' }}>Verified</p>
            </div>

            <div className="text-right">
              <p className="text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontSize: '0.58rem' }}>Certificate ID</p>
              <div className="h-px w-28 bg-slate-200 mb-1 ml-auto" />
              <p className="text-slate-600 font-mono font-semibold" style={{ fontSize: '0.7rem' }}>{certificateCode}</p>
            </div>
          </div>

        </div>

        {/* Blue bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/40" />
      </div>

      {/* Actions */}
      {!preview && (
        <div className="flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand/90 active:scale-95 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 5V2h9v3M3 10H1V5h13v5h-2M3 10v3h9v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print / Download
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify/${certificateCode}`)}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/15 active:scale-95 transition-all"
          >
            Copy Verify Link
          </button>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print {
            position: fixed; inset: 0;
            width: 100vw; height: 100vh;
            max-width: none; box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}

function CornerMark({ pos, flipX, flipY }: { pos: string; flipX?: boolean; flipY?: boolean }) {
  return (
    <svg
      className={`absolute ${pos} text-blue-400`}
      style={{
        width: 18, height: 18,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
      viewBox="0 0 18 18" fill="none"
    >
      <path d="M1 9V1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
