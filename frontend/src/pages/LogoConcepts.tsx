// Temporary showcase page to pick a logo direction — remove once a winner is chosen.

import type { ReactNode } from 'react'

function Wordmark({ children }: { children: ReactNode }) {
  return <span className="text-lg font-bold text-white">{children}</span>
}

function Card({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-navy px-5 py-6 flex items-center justify-center min-h-[88px]">{children}</div>
      <div className="px-3 py-2 text-xs text-slate-500 text-center">
        {n}. {label}
      </div>
    </div>
  )
}

const iconProps = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#3B82F6',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default function LogoConcepts() {
  return (
    <div className="px-5 py-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Logo Concepts</h1>
      <p className="text-sm text-slate-500 mb-6">Pick one by number — all render against the navy navbar background.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card n={1} label="Current — text only, two-tone">
          <Wordmark>
            Test<span className="text-brand">WithMe</span>
          </Wordmark>
        </Card>

        <Card n={2} label="Checkmark badge + wordmark">
          <div className="flex items-center gap-2">
            <svg {...iconProps}>
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={3} label="Shield-check + wordmark">
          <div className="flex items-center gap-2">
            <svg {...iconProps}>
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={4} label="Code brackets + wordmark">
          <div className="flex items-center gap-2">
            <span className="text-brand font-bold text-xl">{'</>'}</span>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={5} label="Magnifying glass (QA-find-bugs) + wordmark">
          <div className="flex items-center gap-2">
            <svg {...iconProps}>
              <circle cx="10" cy="10" r="6" />
              <path d="M15 15l5 5" />
            </svg>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={6} label="Test tube + wordmark">
          <div className="flex items-center gap-2">
            <svg {...iconProps}>
              <path d="M9 3h6" />
              <path d="M10 3v11a2 2 0 1 0 4 0V3" />
              <path d="M9.5 14h5" />
            </svg>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={7} label="Monogram square 'TW' + wordmark">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand text-white text-xs font-bold flex items-center justify-center">
              TW
            </div>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={8} label="Accent dot on wordmark, minimal">
          <Wordmark>
            TestWithMe<span className="text-accent">.</span>
          </Wordmark>
        </Card>

        <Card n={9} label="Two overlapping rings ('test' meets 'you') + wordmark">
          <div className="flex items-center gap-2">
            <svg width="26" height="20" viewBox="0 0 36 24" fill="none">
              <circle cx="14" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="22" cy="12" r="9" stroke="#60A5FA" strokeWidth="2" />
            </svg>
            <Wordmark>
              Test<span className="text-brand">WithMe</span>
            </Wordmark>
          </div>
        </Card>

        <Card n={10} label="Terminal cursor underscore + wordmark">
          <Wordmark>
            TestWithMe<span className="text-accent animate-pulse">_</span>
          </Wordmark>
        </Card>
      </div>
    </div>
  )
}
