import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { DOC_TYPES, DOC_STATUS, DOC_ACCEPT, DOC_MAX_BYTES, DOC_REASONS, getDocRequirements } from '../data/constants'
import Icon from '../components/Icon'

const DOC_ICON = {
  'Aadhaar Card': 'aadhaar', 'Income Certificate': 'income', 'Caste Certificate': 'verified',
  'Marksheet': 'course', 'Bank Passbook': 'bank', 'Domicile Certificate': 'location',
}
const TAG_STYLE = {
  Required: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  Optional: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  'Not Applicable': 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
}

const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const fmtDate = (t) => new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

function DocCard({ name, tag }) {
  const { documentDetails, uploadDocument, removeDocument, getDocumentUrl } = useApp()
  const d = documentDetails[name]
  const done = d.status === DOC_STATUS.UPLOADED
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  const handle = async (file) => {
    if (!file) return
    setBusy(true)
    await uploadDocument(name, file)
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  const open = async (download = false) => {
    const url = await getDocumentUrl(name, download)
    if (!url) { toast.error('Could not open the file'); return }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="glass hover-lift flex flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`icon-badge h-11 w-11 ${done ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
            <Icon name={DOC_ICON[name] || 'file'} size={22} />
          </span>
          <div>
            <h3 className="text-base font-bold leading-tight">{name}</h3>
            <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${TAG_STYLE[tag]}`}>{tag}</span>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${done ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
          <Icon name={done ? 'success' : 'time'} size={13} />
          {done ? 'Uploaded' : 'Pending'}
        </span>
      </div>

      <p className="text-sm opacity-70">{DOC_REASONS[name]}</p>

      {done ? (
        <div className="animate-scale-in rounded-xl bg-slate-500/8 p-3 text-sm">
          <p className="flex items-center gap-2 break-all font-semibold"><Icon name="file" size={16} />{d.fileName || 'Uploaded file'}</p>
          {d.size && <p className="mt-1 text-xs opacity-70">{fmtSize(d.size)} · Uploaded {fmtDate(d.uploadedAt)}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]) }}
          className={`dropzone rounded-xl p-6 text-center ${over ? 'is-over' : ''}`}
        >
          <Icon name="upload" size={26} className="animate-float mx-auto text-brand-500" />
          <p className="mt-2 text-sm font-semibold">Click or drop your original file here</p>
          <p className="text-xs opacity-60">PDF, JPG or PNG · up to {Math.round(DOC_MAX_BYTES / 1024 / 1024)} MB</p>
        </button>
      )}

      <input ref={input} type="file" accept={DOC_ACCEPT} hidden onChange={(e) => handle(e.target.files?.[0])} />

      <div className="mt-auto flex flex-wrap gap-2">
        {done ? (
          <>
            <button onClick={() => open(false)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"><Icon name="view" size={15} />View</button>
            <button onClick={() => open(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/70 px-3 py-2 text-sm font-semibold hover:bg-slate-500/10 dark:border-white/15"><Icon name="download" size={15} />Download</button>
            <button onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/70 px-3 py-2 text-sm font-semibold hover:bg-slate-500/10 dark:border-white/15"><Icon name={busy ? 'loading' : 'refresh'} size={15} className={busy ? 'animate-spin' : ''} />Replace</button>
            <button onClick={() => removeDocument(name)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-500/10"><Icon name="delete" size={15} />Remove</button>
          </>
        ) : (
          <button onClick={() => input.current?.click()} disabled={busy} className="gradient-brand shine inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Icon name={busy ? 'loading' : 'upload'} size={15} className={busy ? 'animate-spin' : ''} />{busy ? 'Uploading…' : 'Upload Document'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Documents() {
  const { documents, user } = useApp()
  const [tab, setTab] = useState('mine')
  const [q, setQ] = useState('')

  const req = useMemo(() => getDocRequirements(user?.category), [user?.category])
  const tagOf = (d) => (req.required.includes(d) ? 'Required' : req.optional.includes(d) ? 'Optional' : 'Not Applicable')
  const isUp = (d) => documents[d] === DOC_STATUS.UPLOADED

  const relevant = DOC_TYPES.filter((d) => req.required.includes(d) || req.optional.includes(d))
  const tabs = [
    { id: 'mine', label: 'For My Category', list: relevant },
    { id: 'pending', label: 'Pending', list: relevant.filter((d) => !isUp(d)) },
    { id: 'uploaded', label: 'Uploaded', list: DOC_TYPES.filter(isUp) },
    { id: 'all', label: 'All Documents', list: DOC_TYPES },
  ]
  const current = tabs.find((t) => t.id === tab)
  const shown = current.list.filter((d) => d.toLowerCase().includes(q.trim().toLowerCase()))

  const done = req.required.filter(isUp).length
  const pct = Math.round((done / req.required.length) * 100)

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-extrabold sm:text-3xl">My Documents</h1>
        <p className="mt-1 opacity-70">Upload your complete original files once. Each document shows as pending until a file is uploaded.</p>
      </div>

      {req.known ? (
        <div className="glass animate-fade-up flex items-center gap-3 rounded-2xl p-4" style={{ animationDelay: '.05s' }}>
          <span className="icon-badge h-10 w-10 bg-brand-500/15 text-brand-600"><Icon name="spark" size={20} /></span>
          <p className="text-sm">
            Smart filter is showing the documents for the <strong>{user.category}</strong> category.
            {req.notApplicable.length > 0 && <> {req.notApplicable.join(', ')} {req.notApplicable.length > 1 ? 'are' : 'is'} not needed for you.</>}
          </p>
        </div>
      ) : (
        <div className="glass animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl p-4">
          <Icon name="info" size={20} className="text-amber-500" />
          <p className="text-sm">Add your category in your profile and this page will show only the documents you need.</p>
          <Link to="/profile" className="ml-auto rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">Complete Profile</Link>
        </div>
      )}

      <div className="glass animate-fade-up rounded-2xl p-5" style={{ animationDelay: '.1s' }}>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2"><Icon name="documents" size={17} />Required Documents Completed</span>
          <span>{done} of {req.required.length} · {pct}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-500/15">
          <div className="progress-bar gradient-brand h-full rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'gradient-brand text-white shadow-md' : 'glass hover:-translate-y-0.5'}`}
            >
              {t.label} <span className="ml-1 opacity-75">({t.list.length})</span>
            </button>
          ))}
        </div>
        <label className="glass ml-auto flex items-center gap-2 rounded-full px-4 py-2">
          <Icon name="search" size={16} className="opacity-60" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" className="w-40 bg-transparent text-sm outline-none" />
        </label>
      </div>

      {shown.length ? (
        <div key={tab + q} className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((name) => <DocCard key={name} name={name} tag={tagOf(name)} />)}
        </div>
      ) : (
        <div className="glass animate-scale-in rounded-2xl p-10 text-center">
          <Icon name="success" size={32} className="mx-auto text-emerald-500" />
          <p className="mt-3 font-semibold">Nothing to show here</p>
          <p className="text-sm opacity-70">Try another tab or clear the search.</p>
        </div>
      )}
    </div>
  )
}