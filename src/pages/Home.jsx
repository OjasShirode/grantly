import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Target, ClipboardList, Bookmark, ArrowRight, Zap, ShieldCheck, BellRing } from 'lucide-react'
import Logo from '../components/Logo'
import ScholarshipCard from '../components/ScholarshipCard'
import { useApp } from '../context/AppContext'
import { btnPrimary, LiveBadge } from '../components/ui'

const steps = [
  { icon: Search, title: 'Discover', text: 'Search and filter live scholarships by category, amount, state and deadline.' },
  { icon: Target, title: 'Check eligibility', text: 'Match your profile against each scholarship and see exactly why.' },
  { icon: Bookmark, title: 'Save & prepare', text: 'Bookmark favourites and track the documents you need.' },
  { icon: ClipboardList, title: 'Track applications', text: 'Update status and follow a clear timeline for every application.' },
]
const perks = [
  { icon: Zap, title: 'Real-time updates', text: 'New scholarships and status changes appear instantly, no refresh needed.' },
  { icon: ShieldCheck, title: 'Transparent matching', text: 'Every eligibility result shows the exact criteria met and missed.' },
  { icon: BellRing, title: 'Deadline alerts', text: 'Colour-coded countdowns for everything you save or track.' },
]

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

export default function Home() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const { authUser, scholarships, stats, online } = useApp()
  const featured = scholarships.filter((s) => s.featured).slice(0, 3)

  const submit = (e) => {
    e.preventDefault()
    nav(authUser ? `/scholarships?q=${encodeURIComponent(q)}` : '/login')
  }

  const liveStats = [[scholarships.length, 'Scholarships listed'], [stats.students, 'Students registered'], [stats.applications, 'Applications tracked']]

  return (
    <div>
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Logo light />
          <div className="flex items-center gap-2">
            {authUser ? (
              <Link to="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Login</Link>
                <Link to="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700 px-4 pb-28 pt-32 text-center text-white">
        <div className="blob absolute -left-24 top-20 h-80 w-80 rounded-full bg-violet/40 blur-3xl" aria-hidden="true" />
        <div className="blob absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-aqua/25 blur-3xl" style={{ animationDelay: '-6s' }} aria-hidden="true" />
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }} className="relative mx-auto max-w-3xl">
          <motion.div variants={fade} className="mb-5 flex justify-center"><LiveBadge online={online} /></motion.div>
          <motion.h1 variants={fade} className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Find scholarships you <span className="gradient-text">actually qualify</span> for.
          </motion.h1>
          <motion.p variants={fade} className="mt-5 text-lg text-indigo-100/85">Discover opportunities, understand eligibility, organise documents and track every application — all updating in real time.</motion.p>
          <motion.form variants={fade} onSubmit={submit} role="search" className="mx-auto mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-2xl">
            <label htmlFor="hero-search" className="sr-only">Search scholarships</label>
            <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or keyword…" className="min-w-0 flex-1 rounded-xl px-3 text-slate-900 placeholder:text-slate-400" />
            <button className={btnPrimary}><Search size={16} aria-hidden="true" /> Search</button>
          </motion.form>
          <motion.div variants={fade} className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={authUser ? '/scholarships' : '/register'} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-lg">Explore scholarships <ArrowRight size={16} /></Link>
            {!authUser && <Link to="/login" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">I have an account</Link>}
          </motion.div>
        </motion.div>
      </section>

      <section className="relative mx-auto -mt-12 grid max-w-4xl grid-cols-3 gap-3 px-4" aria-label="Live statistics">
        {liveStats.map(([n, l]) => (
          <motion.div key={l} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold gradient-text sm:text-4xl">{n}</p>
            <p className="text-xs text-slate-500 dark:text-slate-300 sm:text-sm">{l}</p>
          </motion.div>
        ))}
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-navy-900 dark:text-white">Featured scholarships</h2>
            <Link to={authUser ? '/scholarships' : '/login'} className="text-sm font-semibold text-brand-600">View all →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => authUser
              ? <ScholarshipCard key={s.id} s={s} />
              : (
                <div key={s.id} className="glass rounded-2xl p-5">
                  <h3 className="font-bold text-navy-900 dark:text-white">{s.name}</h3>
                  <p className="text-sm text-slate-500">{s.provider}</p>
                  <Link to="/login" className="mt-4 inline-flex w-full justify-center rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Login to view details</Link>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-navy-900 dark:text-white">How it works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white shadow-lg"><Icon size={20} aria-hidden="true" /></span>
              <p className="mt-3 text-xs font-bold text-brand-600">STEP {i + 1}</p>
              <h3 className="font-bold text-navy-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-white/80 to-indigo-50/60 p-6 dark:border-white/10 dark:from-navy-900/60 dark:to-navy-800/40">
              <Icon className="text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-navy-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-navy-950 px-4 py-8 text-center text-sm text-indigo-200/70">
        <Logo light />
        <p className="mt-3">Eligibility results are indicative. Always confirm rules and deadlines with the official provider.</p>
      </footer>
    </div>
  )
}
