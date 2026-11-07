import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bookmark, BookmarkCheck, Calendar, Share2, ClipboardPlus, ExternalLink, ArrowLeft, FileSearch } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { checkEligibility, urgency, formatINR } from '../utils/eligibility'
import EligibilityPanel from '../components/EligibilityPanel'
import { card, btnPrimary, btnGhost, EmptyState, Spinner, VERIFY_NOTE } from '../components/ui'

export default function ScholarshipDetails() {
  const { id } = useParams()
  const { user, isSaved, toggleSaved, addApplication, getApplication, documents, getScholarship, scholarshipsLoaded } = useApp()
  const s = getScholarship(id)

  if (!scholarshipsLoaded) return <Spinner />
  if (!s) return <EmptyState icon={FileSearch} title="Scholarship not found" text="It may have been removed." action={<Link to="/scholarships" className={btnPrimary}>Back to explorer</Link>} />

  const result = checkEligibility(user, s)
  const u = urgency(s.deadline)
  const saved = isSaved(s.id)
  const inTracker = !!getApplication(s.id)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: s.name, url })
      else { await navigator.clipboard.writeText(url); toast.success('Link copied') }
    } catch { /* cancelled */ }
  }

  const rows = [
    ['Provider', s.provider], s.amount != null && s.amount !== '' && ['Amount', `${formatINR(s.amount)} ${s.amountNote || ''}`], ['Category', s.category],
    s.education?.length && ['Education level', s.education.join(', ')], ['Location', s.state || 'All India'],
    s.incomeLimit != null && ['Income limit', `Up to ${formatINR(s.incomeLimit)}`],
    s.minPercentage != null && ['Minimum academic score', `${s.minPercentage}%`],
    s.allowedCategories?.length && ['Eligible categories', s.allowedCategories.join(', ')],
  ].filter(Boolean)

  return (
    <div>
      <Link to="/scholarships" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><ArrowLeft size={16} /> Back</Link>

      <div className={`${card} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.cls}`}>{u.label}</span>
            <h1 className="mt-2 text-2xl font-extrabold text-navy-900 dark:text-white">{s.name}</h1>
            <p className="text-slate-500">{s.provider}</p>
            {s.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{s.description}</p>}
          </div>
          <div className="text-right">
            {s.amount != null && s.amount !== '' && <p className="text-3xl font-extrabold gradient-text">{formatINR(s.amount)}</p>}
            <p className="flex items-center justify-end gap-1 text-sm text-slate-500"><Calendar size={14} /> {s.deadline ? `Deadline ${s.deadline}` : 'Deadline: see official site'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => toggleSaved(s.id)} className={btnGhost} aria-pressed={saved}>{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {saved ? 'Saved' : 'Save'}</button>
          <Link to="/eligibility" className={btnGhost}>Check eligibility</Link>
          <button onClick={() => addApplication(s.id)} disabled={inTracker} className={btnGhost}><ClipboardPlus size={16} /> {inTracker ? 'In tracker' : 'Add to tracker'}</button>
          <button onClick={share} className={btnGhost}><Share2 size={16} /> Share</button>
          {s.officialUrl ? (
            <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}><ExternalLink size={16} /> Apply on official site</a>
          ) : (
            <button disabled className={btnPrimary}><ExternalLink size={16} /> No official link</button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={`${card} p-6`}>
            <h2 className="font-bold text-navy-900 dark:text-white">Scholarship details</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {rows.map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt><dd className="text-sm font-medium text-slate-800 dark:text-slate-100">{v}</dd></div>)}
            </dl>
          </section>

          {s.documents?.length > 0 && (
            <section className={`${card} p-6`}>
              <h2 className="font-bold text-navy-900 dark:text-white">Required documents</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {s.documents.map((d) => {
                  const st = documents[d] || 'Pending'
                  return (
                    <li key={d} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                      <span>{d}</span>
                      <span className={`text-xs font-semibold ${st === 'Uploaded' ? 'text-emerald-600' : st === 'Not Required' ? 'text-slate-400' : 'text-amber-600'}`}>{st}</span>
                    </li>
                  )
                })}
              </ul>
              <Link to="/documents" className="mt-3 inline-block text-sm font-semibold text-brand-600">Manage documents →</Link>
            </section>
          )}

          {(s.benefits?.length > 0 || s.process?.length > 0) && (
            <section className={`${card} p-6`}>
              {s.benefits?.length > 0 && (<>
                <h2 className="font-bold text-navy-900 dark:text-white">Benefits</h2>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">{s.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
              </>)}
              {s.process?.length > 0 && (<>
                <h2 className="mt-6 font-bold text-navy-900 dark:text-white">Application process</h2>
                <ol className="mt-2 space-y-2">
                  {s.process.map((p, i) => (
                    <li key={p} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{i + 1}</span>{p}
                    </li>
                  ))}
                </ol>
              </>)}
              <p className="mt-4 text-xs text-slate-400">{VERIFY_NOTE}</p>
            </section>
          )}
        </div>
        <aside className={`${card} h-fit p-6`}><EligibilityPanel result={result} title="Your eligibility" /></aside>
      </div>
    </div>
  )
}
