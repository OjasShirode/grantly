import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, SlidersHorizontal, Inbox } from 'lucide-react'
import { CATEGORIES, EDUCATION_LEVELS, STATES } from '../data/constants'
import { daysLeft, checkEligibility } from '../utils/eligibility'
import { useApp } from '../context/AppContext'
import ScholarshipCard from '../components/ScholarshipCard'
import { PageHeader, EmptyState, inputCls, card, btnGhost, LiveBadge } from '../components/ui'

const init = { q: '', category: '', education: '', state: '', maxIncome: '', minAmount: '', maxAmount: '', deadline: '', sort: 'relevance' }

export default function Scholarships() {
  const { user, scholarships, scholarshipsLoaded, online } = useApp()
  const [params] = useSearchParams()
  const [f, setF] = useState({ ...init, q: params.get('q') || '' })
  const [showFilters, setShowFilters] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const score = (s) => checkEligibility(user, s).score
    let out = scholarships.filter((s) => {
      if (q && !`${s.name} ${s.provider} ${s.description || ''} ${s.category}`.toLowerCase().includes(q)) return false
      if (f.category && s.category !== f.category && s.type !== f.category) return false
      if (f.education && !(s.education || []).includes(f.education)) return false
      if (f.state && s.state && s.state !== f.state && s.state !== 'All India') return false
      if (f.maxIncome && s.incomeLimit != null && s.incomeLimit > Number(f.maxIncome)) return false
      if (f.minAmount && !(s.amount >= Number(f.minAmount))) return false
      if (f.maxAmount && s.amount > Number(f.maxAmount)) return false
      const d = daysLeft(s.deadline)
      if (f.deadline === 'soon' && !(d !== null && d >= 0 && d <= 7)) return false
      if (f.deadline === 'upcoming' && !(d !== null && d > 7)) return false
      return true
    })
    if (f.sort === 'amount') out = [...out].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    else if (f.sort === 'deadline') out = [...out].sort((a, b) => (daysLeft(a.deadline) ?? 9e9) - (daysLeft(b.deadline) ?? 9e9))
    else out = [...out].sort((a, b) => score(b) - score(a))
    return out
  }, [f, user, scholarships])

  const filtersUI = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select aria-label="Category" value={f.category} onChange={set('category')} className={inputCls}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      <select aria-label="Education level" value={f.education} onChange={set('education')} className={inputCls}><option value="">All education levels</option>{EDUCATION_LEVELS.map((c) => <option key={c}>{c}</option>)}</select>
      <select aria-label="Location" value={f.state} onChange={set('state')} className={inputCls}><option value="">All locations</option>{STATES.map((c) => <option key={c}>{c}</option>)}</select>
      <select aria-label="Deadline" value={f.deadline} onChange={set('deadline')} className={inputCls}><option value="">Any deadline</option><option value="soon">Closing soon (7 days)</option><option value="upcoming">Upcoming (7+ days)</option></select>
      <input aria-label="Max income limit" type="number" placeholder="Max income limit (₹)" value={f.maxIncome} onChange={set('maxIncome')} className={inputCls} />
      <input aria-label="Minimum amount" type="number" placeholder="Min amount (₹)" value={f.minAmount} onChange={set('minAmount')} className={inputCls} />
      <input aria-label="Maximum amount" type="number" placeholder="Max amount (₹)" value={f.maxAmount} onChange={set('maxAmount')} className={inputCls} />
      <button onClick={() => setF(init)} className={btnGhost}>Reset filters</button>
    </div>
  )

  return (
    <div>
      <PageHeader title="Explore scholarships" subtitle={`${list.length} of ${scholarships.length} scholarships`} action={<LiveBadge online={online} />} />
      <div className={`${card} p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" aria-hidden="true" />
            <input aria-label="Search scholarships" value={f.q} onChange={set('q')} placeholder="Search by name, provider or keyword…" className={`${inputCls} pl-9`} />
          </div>
          <select aria-label="Sort by" value={f.sort} onChange={set('sort')} className={`${inputCls} sm:w-48`}>
            <option value="relevance">Sort: Relevance</option><option value="amount">Sort: Amount</option><option value="deadline">Sort: Deadline</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`${btnGhost} lg:hidden`} aria-expanded={showFilters}><SlidersHorizontal size={16} /> Filters</button>
        </div>
        <div className={`mt-3 ${showFilters ? 'block' : 'hidden'} lg:block`}>{filtersUI}</div>
      </div>

      <div className="mt-6">
        {!scholarshipsLoaded ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
        ) : scholarships.length === 0 ? (
          <EmptyState icon={Inbox} title="No scholarships published yet" text="Scholarships added by an admin will appear here in real time." />
        ) : list.length === 0 ? (
          <EmptyState icon={SearchX} title="No scholarships found" text="Try removing some filters or using a different keyword." action={<button onClick={() => setF(init)} className={btnGhost}>Reset filters</button>} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map((s) => <ScholarshipCard key={s.id} s={s} match={checkEligibility(user, s)} />)}</div>
        )}
      </div>
    </div>
  )
}
