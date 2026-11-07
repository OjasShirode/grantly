import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { checkEligibility } from '../utils/eligibility'
import ScholarshipCard from '../components/ScholarshipCard'
import { PageHeader, EmptyState, btnPrimary } from '../components/ui'

export default function Saved() {
  const { saved, user, getScholarship } = useApp()
  const list = saved.map(getScholarship).filter(Boolean)
  return (
    <div>
      <PageHeader title="Saved scholarships" subtitle={`${list.length} bookmarked · synced across your devices`} />
      {list.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet" text="Bookmark scholarships from the explorer to revisit them here." action={<Link to="/scholarships" className={btnPrimary}>Explore scholarships</Link>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map((s) => <ScholarshipCard key={s.id} s={s} match={checkEligibility(user, s)} />)}</div>
      )}
    </div>
  )
}
