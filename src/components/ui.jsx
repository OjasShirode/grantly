import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const card = 'glass rounded-2xl'
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 hover:shadow-indigo-500/40 disabled:opacity-50'
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10'
export const inputCls = 'w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 dark:border-white/15 dark:bg-navy-950/60 dark:text-white'

export const VERIFY_NOTE = 'Eligibility is indicative. Always confirm rules, amounts and deadlines on the official provider website before applying.'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      {children}
    </div>
  )
}

export function LiveBadge({ online = true }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${online ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-red-100 text-red-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'live-dot bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true" />
      {online ? 'Live' : 'Offline'}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, tone = 'indigo', to }) {
  const tones = {
    indigo: 'from-indigo-500 to-violet-500', green: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400', sky: 'from-sky-500 to-cyan-400',
  }
  const body = (
    <motion.div whileHover={{ y: -3 }} className={`${card} flex items-center gap-4 p-4`}>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}><Icon size={22} aria-hidden="true" /></span>
      <div>
        <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </motion.div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className={`${card} flex flex-col items-center px-6 py-12 text-center`}>
      <span className="grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-white shadow-lg"><Icon size={28} aria-hidden="true" /></span>
      <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label={label}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
    </div>
  )
}

export function friendlyAuthError(e) {
  const c = e?.code || ''
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Incorrect email or password.'
  if (c.includes('email-already-in-use')) return 'An account with this email already exists. Try logging in.'
  if (c.includes('weak-password')) return 'Password must be at least 6 characters.'
  if (c.includes('popup-closed')) return 'Google sign-in was cancelled.'
  if (c.includes('too-many-requests')) return 'Too many attempts. Please wait and try again.'
  if (c.includes('network')) return 'Network error. Check your connection.'
  if (c.includes('operation-not-allowed')) return 'This sign-in method is not enabled in Firebase Authentication.'
  return e?.message || 'Something went wrong.'
}
