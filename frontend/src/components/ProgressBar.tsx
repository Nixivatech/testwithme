export default function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div>
      <div className="h-1.5 w-full rounded-full bg-slate-200">
        <div className="h-1.5 rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {completed}/{total} topics complete
      </p>
    </div>
  )
}
