import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Upload, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, EDUCATION_LEVELS, STUDENT_CATEGORIES, STATES } from '../data/constants'
import { PageHeader, Field, inputCls, btnPrimary, btnGhost, card } from '../components/ui'

const blank = {
  name: '', provider: '', type: 'Government', category: 'Merit Based', amount: '', amountNote: '/ year', state: 'All India',
  incomeLimit: '', minPercentage: '', deadline: '', officialUrl: '', description: '',
  education: [], allowedCategories: [], documents: '', benefits: '', process: '', featured: false,
}
const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean)
const numOrNull = (v) => (v === '' || v == null ? null : Number(v))

function normalise(raw) {
  return {
    name: String(raw.name || '').trim(), provider: String(raw.provider || '').trim(),
    type: raw.type || 'Government', category: raw.category || 'Merit Based',
    amount: numOrNull(raw.amount), amountNote: raw.amountNote || '', state: raw.state || 'All India',
    incomeLimit: numOrNull(raw.incomeLimit), minPercentage: numOrNull(raw.minPercentage),
    deadline: raw.deadline || null, officialUrl: raw.officialUrl || '', description: raw.description || '',
    education: raw.education || [], allowedCategories: raw.allowedCategories || [],
    documents: Array.isArray(raw.documents) ? raw.documents : lines(raw.documents || ''),
    benefits: Array.isArray(raw.benefits) ? raw.benefits : lines(raw.benefits || ''),
    process: Array.isArray(raw.process) ? raw.process : lines(raw.process || ''),
    featured: !!raw.featured,
  }
}

export default function Admin() {
  const { scholarships, addScholarship, deleteScholarship } = useApp()
  const [f, setF] = useState(blank)
  const [json, setJson] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] })

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await addScholarship(normalise(f)); toast.success('Scholarship published live'); setF(blank) }
    catch { toast.error('Could not publish. Check admin permissions.') }
    finally { setBusy(false) }
  }

  const importJson = async () => {
    setBusy(true)
    try {
      const arr = JSON.parse(json)
      if (!Array.isArray(arr)) throw new Error('JSON must be an array')
      const clean = arr.map(normalise).filter((s) => s.name && s.provider)
      for (const s of clean) await addScholarship(s)
      toast.success(`Imported ${clean.length} scholarships`); setJson('')
    } catch (err) { toast.error(err.message || 'Invalid JSON') }
    finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader title="Admin · Scholarships" subtitle="Publish verified scholarships. Students see changes instantly." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className={`${card} grid gap-3 p-5 sm:grid-cols-2`}>
          <h2 className="font-bold text-navy-900 dark:text-white sm:col-span-2">Add scholarship</h2>
          <Field label="Name" id="a-name"><input id="a-name" required value={f.name} onChange={set('name')} className={inputCls} /></Field>
          <Field label="Provider" id="a-prov"><input id="a-prov" required value={f.provider} onChange={set('provider')} className={inputCls} /></Field>
          <Field label="Type" id="a-type"><select id="a-type" value={f.type} onChange={set('type')} className={inputCls}><option>Government</option><option>Private</option></select></Field>
          <Field label="Category" id="a-cat"><select id="a-cat" value={f.category} onChange={set('category')} className={inputCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Amount (₹)" id="a-amt"><input id="a-amt" type="number" min="0" value={f.amount} onChange={set('amount')} className={inputCls} /></Field>
          <Field label="Amount note" id="a-note"><input id="a-note" value={f.amountNote} onChange={set('amountNote')} className={inputCls} placeholder="/ year" /></Field>
          <Field label="State" id="a-state"><select id="a-state" value={f.state} onChange={set('state')} className={inputCls}><option>All India</option>{STATES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Deadline (leave empty if unknown)" id="a-dl"><input id="a-dl" type="date" value={f.deadline} onChange={set('deadline')} className={inputCls} /></Field>
          <Field label="Max family income (₹)" id="a-inc"><input id="a-inc" type="number" min="0" value={f.incomeLimit} onChange={set('incomeLimit')} className={inputCls} /></Field>
          <Field label="Min percentage" id="a-pct"><input id="a-pct" type="number" min="0" max="100" value={f.minPercentage} onChange={set('minPercentage')} className={inputCls} /></Field>
          <div className="sm:col-span-2"><Field label="Official website URL" id="a-url"><input id="a-url" type="url" value={f.officialUrl} onChange={set('officialUrl')} className={inputCls} placeholder="https://…" /></Field></div>
          <fieldset className="sm:col-span-2"><legend className="mb-1 text-sm font-medium">Education levels</legend><div className="flex flex-wrap gap-2">{EDUCATION_LEVELS.map((x) => <label key={x} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={f.education.includes(x)} onChange={() => toggle('education', x)} />{x}</label>)}</div></fieldset>
          <fieldset className="sm:col-span-2"><legend className="mb-1 text-sm font-medium">Eligible categories (none = all)</legend><div className="flex flex-wrap gap-2">{STUDENT_CATEGORIES.map((x) => <label key={x} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={f.allowedCategories.includes(x)} onChange={() => toggle('allowedCategories', x)} />{x}</label>)}</div></fieldset>
          <div className="sm:col-span-2"><Field label="Description" id="a-desc"><textarea id="a-desc" rows={2} value={f.description} onChange={set('description')} className={inputCls} /></Field></div>
          <Field label="Documents (one per line)" id="a-docs"><textarea id="a-docs" rows={3} value={f.documents} onChange={set('documents')} className={inputCls} /></Field>
          <Field label="Benefits (one per line)" id="a-ben"><textarea id="a-ben" rows={3} value={f.benefits} onChange={set('benefits')} className={inputCls} /></Field>
          <div className="sm:col-span-2"><Field label="Application steps (one per line)" id="a-proc"><textarea id="a-proc" rows={3} value={f.process} onChange={set('process')} className={inputCls} /></Field></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Feature on landing page</label>
          <div className="sm:col-span-2"><button disabled={busy} className={btnPrimary}><Plus size={16} /> Publish</button></div>
        </form>

        <div className="space-y-6">
          <section className={`${card} p-5`}>
            <h2 className="font-bold text-navy-900 dark:text-white">Bulk import (JSON array)</h2>
            <p className="mt-1 text-xs text-slate-500">Use the same field names as <code>seed/scholarships.template.json</code>. Only import data you verified from the official source.</p>
            <textarea aria-label="JSON to import" rows={8} value={json} onChange={(e) => setJson(e.target.value)} className={`${inputCls} mt-3 font-mono text-xs`} placeholder='[{ "name": "…", "provider": "…" }]' />
            <button onClick={importJson} disabled={busy || !json.trim()} className={`${btnGhost} mt-3`}><Upload size={16} /> Import</button>
          </section>
          <section className={`${card} p-5`}>
            <h2 className="font-bold text-navy-900 dark:text-white">Published ({scholarships.length})</h2>
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
              {scholarships.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{s.name}</span>
                  {s.builtin
                    ? <span className="shrink-0 text-xs text-slate-400">Built-in</span>
                    : <button onClick={() => window.confirm(`Delete "${s.name}"?`) && deleteScholarship(s.id)} aria-label={`Delete ${s.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
                </li>
              ))}
              {scholarships.length === 0 && <li className="py-2 text-sm text-slate-500">Nothing published yet.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}