import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { PageHeader, card, btnGhost } from '../components/ui'

export default function Settings() {
  const { theme, setTheme, clearMyData, logout, authUser } = useApp()
  const nav = useNavigate()

  const clear = async () => {
    if (window.confirm('This permanently deletes your saved scholarships, applications, documents and notifications. Your profile is kept. Continue?')) {
      try { await clearMyData(); toast.success('Your data was cleared') } catch { toast.error('Could not clear data.') }
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your preferences." />
      <section className={`${card} p-5`}>
        <h2 className="font-bold text-navy-900 dark:text-white">Appearance</h2>
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Theme">
          {['light', 'dark'].map((t) => (
            <button key={t} role="radio" aria-checked={theme === t} onClick={() => setTheme(t)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${theme === t ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}>{t}</button>
          ))}
        </div>
      </section>
      <section className={`${card} mt-5 p-5`}>
        <h2 className="font-bold text-navy-900 dark:text-white">Account</h2>
        <p className="mt-1 text-sm text-slate-500">Signed in as {authUser?.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={async () => { await logout(); nav('/') }} className={btnGhost}>Log out</button>
          <button onClick={clear} className={`${btnGhost} !border-red-300 !text-red-600`}>Clear my tracked data</button>
        </div>
      </section>
    </div>
  )
}
