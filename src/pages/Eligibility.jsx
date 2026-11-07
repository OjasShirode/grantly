import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Target, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { EDUCATION_LEVELS, STUDENT_CATEGORIES, STATES } from '../data/constants'
import { evaluateAll, formatINR } from '../utils/eligibility'
import EligibilityPanel from '../components/EligibilityPanel'
import { PageHeader, Field, inputCls, card, btnPrimary, LiveBadge } from '../components/ui'

export default function Eligibility() {
  const { user, updateUser, scholarships, online } = useApp()
  const [open, setOpen] = useState(null)
  const [tab, setTab] = useState('eligible')

  const results = useMemo(() => evaluateAll(user, scholarships).sort((a, b) => b.result.score - a.result.score), [user, scholarships])
  const eligible = results.filter((r) => r.result.eligible)
  const others = results.filter((r) => !r.result.eligible)
  const shown = tab === 'eligible' ? eligible : others
  const upd = (k, num) => (e) => updateUser({ [k]: num ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })

  return (
    <div>
      <PageHeader title="Smart Eligibility Checker" subtitle="Change your details and the results update instantly — saved to your profile." action={<LiveBadge online={online} />} />

      <section className={`${card} p-5`} aria-label="Your details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Education level" id="e-level"><select id="e-level" value={user.educationLevel} onChange={upd('educationLevel')} className={inputCls}><option value="">Select</option>{EDUCATION_LEVELS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="State" id="e-state"><select id="e-state" value={user.state} onChange={upd('state')} className={inputCls}><option value="">Select</option>{STATES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Category" id="e-cat"><select id="e-cat" value={user.category} onChange={upd('category')} className={inputCls}><option value="">Select</option>{STUDENT_CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Academic percentage" id="e-pct"><input id="e-pct" type="number" min="0" max="100" step="any" value={user.percentage} onChange={upd('percentage', true)} className={inputCls} /></Field>
          <Field label="Annual family income (₹)" id="e-inc"><input id="e-inc" type="number" min="0" value={user.income} onChange={upd('income', true)} className={inputCls} /></Field>
          <Field label="Current course" id="e-course"><input id="e-course" value={user.course} onChange={upd('course')} className={inputCls} /></Field>
        </div>
      </section>

      <div className="mt-6 flex gap-2" role="tablist">
        {[['eligible', `Eligible (${eligible.length})`], ['other', `Not eligible (${others.length})`]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === k ? 'gradient-brand text-white shadow-md' : 'glass text-slate-600 dark:text-slate-200'}`}>{label}</button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {shown.length === 0 && <div className={`${card} p-8 text-center text-sm text-slate-500`}><Target className="mx-auto mb-2 text-brand-500" /> No scholarships in this list for your current details.</div>}
        {shown.map(({ scholarship: s, result }) => (
          <article key={s.id} className={`${card} p-4`}>
            <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
              <div>
                <h3 className="font-bold text-navy-900 dark:text-white">{s.name}</h3>
                <p className="text-sm text-slate-500">{s.amount != null && s.amount !== '' ? `${formatINR(s.amount)} · ` : ''}{result.matched}/{result.total} criteria matched</p>
              </div>
              <ChevronDown className={`shrink-0 transition ${open === s.id ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open === s.id && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
                <EligibilityPanel result={result} />
                <Link to={`/scholarships/${s.id}`} className={`${btnPrimary} mt-4`}>View scholarship</Link>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
