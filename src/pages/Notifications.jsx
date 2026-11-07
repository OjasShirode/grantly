import { Link } from 'react-router-dom'
import { Bell, AlarmClock, RefreshCw, Sparkles, CheckCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader, EmptyState, card, btnGhost } from '../components/ui'

const icons = { deadline: AlarmClock, update: RefreshCw, new: Sparkles }

export default function Notifications() {
  const { notifications, deadlineAlerts, markRead, markAllRead } = useApp()
  const empty = notifications.length === 0 && deadlineAlerts.length === 0

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Deadline alerts and activity updates." action={<button onClick={markAllRead} className={btnGhost}><CheckCheck size={16} /> Mark all read</button>} />
      {empty ? <EmptyState icon={Bell} title="You're all caught up" text="New alerts will appear here." /> : (
        <ul className="space-y-3">
          {deadlineAlerts.map((n) => (
            <li key={n.id} className={`${card} flex items-center gap-3 border-l-4 border-l-red-500 p-4`}>
              <AlarmClock className="text-red-500" aria-hidden="true" />
              <p className="flex-1 text-sm text-slate-800 dark:text-slate-100">{n.text}</p>
              <Link to={`/scholarships/${n.scholarshipId}`} className="text-sm font-semibold text-brand-600">View</Link>
            </li>
          ))}
          {notifications.map((n) => {
            const Icon = icons[n.type] || Bell
            return (
              <li key={n.id} className={`${card} flex items-center gap-3 p-4 ${n.read ? 'opacity-60' : 'border-l-4 border-l-brand-500'}`}>
                <Icon className="text-brand-600" aria-hidden="true" />
                <div className="flex-1"><p className="text-sm text-slate-800 dark:text-slate-100">{n.text}</p><p className="text-xs text-slate-400">{new Date(n.time).toLocaleString()}</p></div>
                {!n.read && <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-brand-600">Mark read</button>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
