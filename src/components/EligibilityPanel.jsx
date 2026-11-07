import { CheckCircle2, XCircle } from 'lucide-react'

export default function EligibilityPanel({ result, title = 'Eligibility breakdown' }) {
  if (!result || result.total === 0) {
    return <p className="text-sm text-slate-500">Complete your profile to see an eligibility breakdown.</p>
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy-900 dark:text-white">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {result.eligible ? 'Eligible' : 'Not fully eligible'}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" role="progressbar" aria-valuenow={result.score} aria-valuemin={0} aria-valuemax={100} aria-label="Criteria matched">
        <div className={`h-full rounded-full ${result.eligible ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${result.score}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{result.matched} of {result.total} criteria matched</p>
      <ul className="mt-4 space-y-3">
        {result.criteria.map((c) => (
          <li key={c.key} className="flex gap-3">
            {c.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" aria-label="Met" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" aria-label="Not met" />}
            <div className="text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{c.label}</p>
              <p className="text-slate-500 dark:text-slate-400">Required: {c.required} · You: {c.actual}</p>
              <p className={c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{c.reason}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-400">Eligibility is illustrative; actual scholarship rules must be verified.</p>
    </div>
  )
}
