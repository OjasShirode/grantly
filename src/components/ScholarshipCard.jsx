import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Calendar, MapPin, GraduationCap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { urgency, formatINR } from '../utils/eligibility'
import { card } from './ui'

const accent = {
  'Merit Based': 'from-indigo-500 to-violet-500', 'Need Based': 'from-emerald-500 to-teal-400',
  Government: 'from-sky-500 to-cyan-400', Private: 'from-amber-500 to-orange-400',
}

export default function ScholarshipCard({ s, match }) {
  const { isSaved, toggleSaved } = useApp()
  const u = urgency(s.deadline)
  const saved = isSaved(s.id)

  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className={`${card} relative flex flex-col overflow-hidden p-5`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent[s.category] || accent['Merit Based']}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-indigo-500/20 dark:text-indigo-200">{s.category}</span>
          {s.type && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">{s.type}</span>}
        </div>
        <button onClick={() => toggleSaved(s.id)} aria-pressed={saved} aria-label={saved ? `Remove ${s.name} from saved` : `Save ${s.name}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
          {saved ? <BookmarkCheck size={20} className="text-brand-600" /> : <Bookmark size={20} />}
        </button>
      </div>

      <h3 className="mt-3 text-base font-bold leading-snug text-navy-900 dark:text-white">
        <Link to={`/scholarships/${s.id}`} className="hover:text-brand-600">{s.name}</Link>
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{s.provider}</p>

      {s.amount != null && s.amount !== '' && (
        <p className="mt-3 text-2xl font-extrabold gradient-text">{formatINR(s.amount)}<span className="text-xs font-medium text-slate-400"> {s.amountNote || ''}</span></p>
      )}

      <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        {s.education?.length > 0 && <li className="flex items-center gap-2"><GraduationCap size={15} aria-hidden="true" /> {s.education.join(', ')}</li>}
        <li className="flex items-center gap-2"><MapPin size={15} aria-hidden="true" /> {s.state || 'All India'}</li>
        <li className="flex items-center gap-2">
          <Calendar size={15} aria-hidden="true" />
          {s.deadline ? new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'See official site'}
          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${u.cls}`}>{u.label}</span>
        </li>
      </ul>

      {match && match.total > 0 && (
        <p className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold ${match.eligible ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
          {match.eligible ? 'Likely eligible' : 'Partial match'} · {match.matched}/{match.total} criteria
        </p>
      )}

      <Link to={`/scholarships/${s.id}`} className="mt-4 inline-flex justify-center rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:brightness-110">View details</Link>
    </motion.article>
  )
}
