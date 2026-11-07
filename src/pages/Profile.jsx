import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { EDUCATION_LEVELS, STUDENT_CATEGORIES, STATES } from '../data/constants'
import ProfilePhoto from '../components/ProfilePhoto'
import Icon from '../components/Icon'

const str = (v) => (v === '' || v == null ? '' : String(v))

function Field({ id, label, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, profileCompletion } = useApp()
  const [f, setF] = useState(() => ({
    name: user.name || '', phone: user.phone || '', state: user.state || '', educationLevel: user.educationLevel || '',
    course: user.course || '', institution: user.institution || '', percentage: str(user.percentage),
    income: str(user.income), category: user.category || '',
  }))
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  // The "just registered" hint is no longer needed once this page is open
  useEffect(() => { try { sessionStorage.removeItem('grantly_new') } catch { /* ignore */ } }, [])

  const save = async (e) => {
    e.preventDefault()
    const phone = f.phone.replace(/\D/g, '').slice(-10)
    if (f.name.trim().length < 2) return toast.error('Enter your full name')
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return toast.error('Enter a valid 10-digit mobile number')
    if (f.percentage !== '' && (Number(f.percentage) < 0 || Number(f.percentage) > 100)) return toast.error('Percentage must be between 0 and 100')
    if (f.income !== '' && Number(f.income) < 0) return toast.error('Income cannot be negative')
    setSaving(true)
    try {
      await updateUser({ ...f, name: f.name.trim(), phone })
      toast.success('Profile saved')
    } catch {
      toast.error('Could not save. Please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-extrabold sm:text-3xl">My Profile</h1>
        <p className="mt-1 opacity-70">Your details are saved to your account and are used to match scholarships and documents for you.</p>
      </div>

      <div className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: '.05s' }}>
        <ProfilePhoto />
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2"><Icon name="verified" size={16} />Profile Completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10">
            <div className="progress-bar gradient-brand h-full rounded-full" style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6" noValidate>
        <section className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: '.1s' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Icon name="profile" size={18} />Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-name" label="Full Name"><input id="p-name" className="field" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field id="p-phone" label="Phone"><input id="p-phone" type="tel" inputMode="numeric" className="field" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
            <Field id="p-email" label="Email"><input id="p-email" className="field" value={user.email || ''} readOnly /></Field>
            <Field id="p-uid" label="Unique ID" hint="Your sign-in ID cannot be changed."><input id="p-uid" className="field" value={user.uniqueId || 'Not set'} readOnly /></Field>
          </div>
        </section>

        <section className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: '.15s' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Icon name="course" size={18} />Education</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-edu" label="Education Level">
              <select id="p-edu" className="field" value={f.educationLevel} onChange={set('educationLevel')}>
                <option value="">Select level</option>
                {EDUCATION_LEVELS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field id="p-course" label="Course"><input id="p-course" className="field" value={f.course} onChange={set('course')} placeholder="For example: B.Tech Computer Engineering" /></Field>
            <Field id="p-inst" label="Institution"><input id="p-inst" className="field" value={f.institution} onChange={set('institution')} /></Field>
            <Field id="p-pct" label="Latest Percentage"><input id="p-pct" type="number" min="0" max="100" step="0.01" inputMode="decimal" className="field" value={f.percentage} onChange={set('percentage')} /></Field>
          </div>
        </section>

        <section className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: '.2s' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Icon name="location" size={18} />Eligibility Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-state" label="State">
              <select id="p-state" className="field" value={f.state} onChange={set('state')}>
                <option value="">Select state</option>
                {STATES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field id="p-cat" label="Category" hint="This decides which documents you need to upload.">
              <select id="p-cat" className="field" value={f.category} onChange={set('category')}>
                <option value="">Select category</option>
                {STUDENT_CATEGORIES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field id="p-inc" label="Annual Family Income (₹)"><input id="p-inc" type="number" min="0" inputMode="numeric" className="field" value={f.income} onChange={set('income')} /></Field>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary shine sm:w-auto sm:px-10">
          <Icon name={saving ? 'loading' : 'check'} size={18} className={saving ? 'animate-spin' : ''} />
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}