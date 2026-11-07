import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { UNIQUE_ID_RE } from '../data/constants'
import AuthShell from '../components/AuthShell'
import Icon from '../components/Icon'

const ID_MESSAGES = {
  idle: 'Choose a Unique ID. You will use it to sign in.',
  invalid: 'Use 4 to 20 letters, numbers or underscores (no spaces).',
  checking: 'Checking availability…',
  available: 'This Unique ID is available.',
  taken: 'This Unique ID is already taken. Try another one.',
  error: 'Could not check right now. Check your connection.',
}
const ID_COLOR = {
  idle: 'opacity-60', invalid: 'text-amber-600', checking: 'opacity-70',
  available: 'text-emerald-600', taken: 'text-rose-600', error: 'text-rose-600',
}

function errorText(e) {
  switch (e?.code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try signing in.'
    case 'auth/weak-password': return 'Choose a stronger password with at least 6 characters.'
    case 'auth/invalid-email': return 'Enter a valid email address.'
    case 'auth/network-request-failed': return 'Network problem. Check your connection and try again.'
    case 'app/id-taken': return 'That Unique ID is not available. Please choose another one.'
    default: return e?.message || 'Could not create your account. Please try again.'
  }
}

export default function Register() {
  const { register, checkUniqueId } = useApp()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', uniqueId: '', password: '' })
  const [show, setShow] = useState(false)
  const [idState, setIdState] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const seq = useRef(0)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  // Live check: is this Unique ID free? (waits for a short pause in typing)
  useEffect(() => {
    const id = f.uniqueId.trim().toLowerCase()
    if (!id) { setIdState('idle'); return }
    if (!UNIQUE_ID_RE.test(id)) { setIdState('invalid'); return }
    setIdState('checking')
    const n = ++seq.current
    const t = setTimeout(async () => {
      try { const r = await checkUniqueId(id); if (n === seq.current) setIdState(r) }
      catch { if (n === seq.current) setIdState('error') }
    }, 450)
    return () => clearTimeout(t)
  }, [f.uniqueId, checkUniqueId])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    const name = f.name.trim()
    const email = f.email.trim()
    const phone = f.phone.replace(/\D/g, '').slice(-10)
    if (name.length < 2) return setErr('Enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.')
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr('Enter a valid 10-digit mobile number.')
    if (idState === 'checking') return setErr('Please wait while we check your Unique ID.')
    if (idState !== 'available') return setErr(ID_MESSAGES[idState === 'idle' ? 'invalid' : idState])
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.')
    setBusy(true)
    try {
      await register({ name, email, phone, uniqueId: f.uniqueId }, f.password)
      toast.success('Welcome to Grantly')
      navigate('/profile', { replace: true })
    } catch (ex) {
      setErr(errorText(ex))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="It takes less than a minute."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-brand-600 hover:underline">Sign In</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">Full Name</label>
          <input id="name" className="field" value={f.name} onChange={set('name')} autoComplete="name" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">Email</label>
          <input id="email" type="email" className="field" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-semibold">Phone</label>
          <input id="phone" type="tel" inputMode="numeric" className="field" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="10-digit mobile number" />
        </div>
        <div>
          <label htmlFor="uid" className="mb-1 block text-sm font-semibold">Unique ID</label>
          <div className="relative">
            <input
              id="uid" className="field pr-11" value={f.uniqueId} onChange={set('uniqueId')}
              autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" maxLength={20}
              placeholder="for example: asha_2026"
              aria-describedby="uid-help"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {idState === 'checking' && <Icon name="loading" size={18} className="animate-spin opacity-60" />}
              {idState === 'available' && <Icon name="success" size={18} className="animate-scale-in text-emerald-600" />}
              {(idState === 'taken' || idState === 'invalid') && <Icon name="error" size={18} className="animate-scale-in text-rose-600" />}
            </span>
          </div>
          <p id="uid-help" className={`mt-1 text-xs ${ID_COLOR[idState]}`} aria-live="polite">{ID_MESSAGES[idState]}</p>
        </div>
        <div>
          <label htmlFor="pw" className="mb-1 block text-sm font-semibold">Password</label>
          <div className="relative">
            <input id="pw" type={show ? 'text' : 'password'} className="field pr-11" value={f.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 6 characters" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg opacity-70 hover:bg-black/5">
              <Icon name={show ? 'hide' : 'view'} size={18} />
            </button>
          </div>
        </div>

        {err && <p role="alert" className="animate-scale-in flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300"><Icon name="warning" size={16} className="mt-0.5 shrink-0" />{err}</p>}

        <button type="submit" disabled={busy} className="btn-primary shine">
          <Icon name={busy ? 'loading' : 'signup'} size={18} className={busy ? 'animate-spin' : ''} />
          {busy ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  )
}