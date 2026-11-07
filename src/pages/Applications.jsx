import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { STATUSES } from '../data/constants'
import { PageHeader, EmptyState, card, btnPrimary, inputCls } from '../components/ui'

const tone = {
  'Not Started': 'bg-slate-100 text-slate-600', 'In Progress': 'bg-orange-100 text-orange-800',
  Submitted: 'bg-sky-100 text-sky-700', 'Under Review': 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700', Rejected: 'bg-red-100 text-red-700',
}
const FLOW = ['Not Started', 'In Progress', 'Submitted', 'Under Review', 'Approved']

function Timeline({ app }) {
  const reached = app.history.map((h) => h.status)
  const steps = app.status === 'Rejected' ? [...FLOW.slice(0, 4), 'Rejected'] : FLOW
  return (
    <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-3" aria-label="Application timeline">
      {steps.map((s) => {
        const done = reached.includes(s)
        const entry = app.history.find((h) => h.status === s)
        return (
          <li key={s} className="flex items-center gap-2 text-xs">
            {done ? <CheckCircle2 size={16} className={s === 'Rejected' ? 'text-red-500' : 'text-emerald-500'} /> : <Circle size={16} className="text-slate-300" />}
            <span className={done ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-400'}>{s}</span>
            {entry && <span className="text-slate-400">{new Date(entry.at).toLocaleDateString()}</span>}
          </li>
        )
      })}
    </ol>
  )
}

export default function Applications() {
  const { applications, updateStatus, updateNotes, removeApplication, getScholarship } = useApp()
  const [filter, setFilter] = useState('All')
  const list = applications.filter((a) => filter === 'All' || a.status === filter)

  return (
    <div>
      <PageHeader title="My applications" subtitle="Track every scholarship application from start to decision." />
      {applications.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No applications yet" text="Open a scholarship and choose “Add to tracker” to start tracking it here." action={<Link to="/scholarships" className={btnPrimary}>Find scholarships</Link>} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {['All', ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === s ? 'gradient-brand text-white' : 'glass text-slate-600 dark:text-slate-200'}`}>
                {s} ({s === 'All' ? applications.length : applications.filter((a) => a.status === s).length})
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {list.map((app) => {
              const s = getScholarship(app.scholarshipId)
              const name = s?.name || 'Scholarship no longer listed'
              return (
                <article key={app.scholarshipId} className={`${card} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {s ? <Link to={`/scholarships/${s.id}`} className="font-bold text-navy-900 hover:text-brand-600 dark:text-white">{name}</Link> : <span className="font-bold text-slate-500">{name}</span>}
                      {s && <p className="text-sm text-slate-500">{s.provider}{s.deadline ? ` · Deadline ${s.deadline}` : ''}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[app.status]}`}>{app.status}</span>
                      <select aria-label={`Update status for ${name}`} value={app.status} onChange={(e) => updateStatus(app.scholarshipId, e.target.value)} className={`${inputCls} w-40`}>
                        {STATUSES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                      <button onClick={() => removeApplication(app.scholarshipId)} aria-label={`Remove ${name}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <Timeline app={app} />
                  <label htmlFor={`notes-${app.scholarshipId}`} className="mt-4 block text-xs font-semibold text-slate-500">Notes (saved when you click away)</label>
                  <textarea id={`notes-${app.scholarshipId}`} key={app.notes} rows={2} defaultValue={app.notes}
                    onBlur={(e) => { if (e.target.value !== app.notes) updateNotes(app.scholarshipId, e.target.value) }}
                    placeholder="Reference ID, contacts, to-dos…" className={`${inputCls} mt-1`} />
                  <details className="mt-3 text-xs text-slate-500">
                    <summary className="cursor-pointer font-semibold">Application history</summary>
                    <ul className="mt-2 space-y-1">{[...app.history].reverse().map((h, i) => <li key={i}>{h.status} — {new Date(h.at).toLocaleString()}</li>)}</ul>
                  </details>
                </article>
              )
            })}
            {list.length === 0 && <p className="text-center text-sm text-slate-500">No applications with this status.</p>}
          </div>
        </>
      )}
    </div>
  )
}