import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, CheckCircle2, Bookmark, ClipboardCheck, Clock, Inbox } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApp } from '../context/AppContext'
import { STATUSES } from '../data/constants'
import { evaluateAll, urgency, daysLeft } from '../utils/eligibility'
import { StatCard, card, LiveBadge, EmptyState, btnPrimary } from '../components/ui'
import ScholarshipCard from '../components/ScholarshipCard'

const COLORS = ['#b8b5a9', '#d97757', '#6a9bcc', '#e8a838', '#788c5d', '#bf4d43']

export default function Dashboard() {
  const { user, saved, applications, notifications, scholarships, scholarshipsLoaded, online, isAdmin, profileCompletion: completion } = useApp()

  const results = useMemo(() => evaluateAll(user, scholarships), [user, scholarships])
  const eligible = results.filter((r) => r.result.eligible)
  const recommended = [...results].filter((r) => r.result.total > 0).sort((a, b) => b.result.score - a.result.score).slice(0, 3)
  const submitted = applications.filter((a) => !['Not Started', 'In Progress'].includes(a.status)).length
  const upcoming = scholarships.filter((s) => s.deadline && daysLeft(s.deadline) >= 0).sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)).slice(0, 5)
  // Same live value the Profile page shows (it includes the profile photo)
  const chartData = STATUSES.map((s) => ({ name: s, value: applications.filter((a) => a.status === s).length })).filter((d) => d.value > 0)

  return (
    <div>
      <div className="gradient-brand relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-orange-900/10 sm:p-8">
        <div className="blob absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <LiveBadge online={online} />
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">Welcome back, {(user.name || 'Student').split(' ')[0]} 👋</h1>
            <p className="mt-1 text-sm text-orange-50">Everything below updates in real time.</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-5 py-3 text-center backdrop-blur">
            <p className="text-3xl font-extrabold">{completion}%</p>
            <p className="text-xs text-orange-50">Profile complete</p>
          </div>
        </div>
      </div>

      {completion < 100 && (
        <Link to="/profile" className="mb-5 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <span>Complete your profile for accurate matches.</span><span className="font-semibold">Update →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Award} label="Total scholarships" value={scholarships.length} to="/scholarships" />
        <StatCard icon={CheckCircle2} label="Eligible for you" value={eligible.length} tone="green" to="/eligibility" />
        <StatCard icon={Bookmark} label="Saved" value={saved.length} tone="amber" to="/saved" />
        <StatCard icon={ClipboardCheck} label="Applications submitted" value={submitted} tone="sky" to="/applications" />
      </div>

      {scholarshipsLoaded && scholarships.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Inbox} title="No scholarships published yet" text="Scholarships added by an admin appear here instantly."
            action={isAdmin ? <Link to="/admin" className={btnPrimary}>Add scholarships</Link> : null} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className={`${card} p-5 lg:col-span-2`} aria-labelledby="deadlines">
              <h2 id="deadlines" className="flex items-center gap-2 font-bold text-navy-900 dark:text-white"><Clock size={18} aria-hidden="true" /> Upcoming deadlines</h2>
              {upcoming.length === 0 ? <p className="mt-4 text-sm text-slate-500">No upcoming deadlines.</p> : (
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
                  {upcoming.map((s) => {
                    const u = urgency(s.deadline)
                    return (
                      <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                        <Link to={`/scholarships/${s.id}`} className="min-w-0 text-sm font-medium text-slate-800 hover:text-brand-600 dark:text-slate-100">
                          <span className="block truncate">{s.name}</span><span className="text-xs text-slate-400">{s.deadline}</span>
                        </Link>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.cls}`}>{u.label}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className={`${card} p-5`} aria-labelledby="overview">
              <h2 id="overview" className="font-bold text-navy-900 dark:text-white">Application overview</h2>
              {chartData.length === 0 ? (
                <p className="mt-6 text-center text-sm text-slate-500">No applications yet. <Link to="/scholarships" className="font-semibold text-brand-600">Find one</Link></p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {chartData.map((d) => <Cell key={d.name} fill={COLORS[STATUSES.indexOf(d.name)]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          {recommended.length > 0 && (
            <section className="mt-8" aria-labelledby="rec">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="rec" className="text-lg font-bold text-navy-900 dark:text-white">Recommended for you</h2>
                <Link to="/eligibility" className="text-sm font-semibold text-brand-600">See all matches →</Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {recommended.map(({ scholarship, result }) => <ScholarshipCard key={scholarship.id} s={scholarship} match={result} />)}
              </div>
            </section>
          )}
        </>
      )}

      <section className={`${card} mt-8 p-5`} aria-labelledby="activity">
        <h2 id="activity" className="font-bold text-navy-900 dark:text-white">Recent activity</h2>
        {notifications.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nothing yet.</p> : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {notifications.slice(0, 5).map((n) => (
              <li key={n.id} className="flex justify-between gap-3"><span>{n.text}</span><span className="shrink-0 text-xs text-slate-400">{new Date(n.time).toLocaleDateString()}</span></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}