import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import AuthShell from '../components/AuthShell'
import Icon from '../components/Icon'

const maskEmail = (e) => String(e).replace(/^(.).*?(@.*)$/, '$1•••$2')

function errorText(e) {
  switch (e?.code) {
    case 'app/id-not-found': return 'No account found with that Unique ID.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect Unique ID or password.'
    case 'auth/invalid-email': return 'Enter a valid Unique ID.'
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed': return 'Network problem. Check your connection and try again.'
    default: return e?.message || 'Something went wrong. Please try again.'
  }
}

export default function Login() {
  const { login, resetPassword } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login') // 'login' | 'forgot'
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sentTo, setSentTo] = useState('')

  const switchMode = (m) => { setMode(m); setErr(''); setSentTo('') }
  // Fields start read-only so browsers do not auto-fill them; they unlock the moment the person taps one
  const unlock = (e) => e.currentTarget.removeAttribute('readonly')

  // Always open the sign-in page with empty fields, even if a browser tried to restore old values
  useEffect(() => {
    setId(''); setPassword('')
    const t = setTimeout(() => { setId(''); setPassword('') }, 150)
    return () => clearTimeout(t)
  }, [])

  const submitLogin = async (e) => {
    e.preventDefault()
    setErr('')
    if (!id.trim()) return setErr('Enter your Unique ID.')
    if (!password) return setErr('Enter your password.')
    setBusy(true)
    try {
      await login(id, password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (ex) {
      setErr(errorText(ex))
    } finally {
      setBusy(false)
    }
  }

  const submitForgot = async (e) => {
    e.preventDefault()
    setErr('')
    if (!id.trim()) return setErr('Enter your Unique ID to receive a reset link.')
    setBusy(true)
    try {
      const email = await resetPassword(id)
      setSentTo(email)
      toast.success('Reset link sent')
    } catch (ex) {
      setErr(errorText(ex))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title={mode === 'login' ? 'Welcome Back' : 'Reset Your Password'}
      subtitle={mode === 'login' ? 'Sign in with your Unique ID.' : 'We will email you a link to choose a new password.'}
      footer={mode === 'login'
        ? <>New to Grantly? <Link to="/register" className="font-bold text-brand-600 hover:underline">Create An Account</Link></>
        : <button type="button" onClick={() => switchMode('login')} className="font-bold text-brand-600 hover:underline">Back To Sign In</button>}
    >
      {mode === 'login' ? (
        <form onSubmit={submitLogin} className="space-y-4" noValidate autoComplete="off">
          <div>
            <label htmlFor="lid" className="mb-1 block text-sm font-semibold">Unique ID</label>
            {/* readOnly until focused + autoComplete off: stops the browser pre-filling saved logins */}
            <input id="lid" name="grantly-login-id" className="field" value={id} onChange={(e) => setId(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" placeholder="Your Unique ID" readOnly onFocus={unlock} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="lpw" className="text-sm font-semibold">Password</label>
              <button type="button" onClick={() => switchMode('forgot')} className="text-sm font-semibold text-brand-600 hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <input id="lpw" name="grantly-login-secret" type={show ? 'text' : 'password'} className="field pr-11" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Your password" readOnly onFocus={unlock} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg opacity-70 hover:bg-black/5">
                <Icon name={show ? 'hide' : 'view'} size={18} />
              </button>
            </div>
          </div>

          {err && <p role="alert" className="animate-scale-in flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300"><Icon name="warning" size={16} className="mt-0.5 shrink-0" />{err}</p>}

          <button type="submit" disabled={busy} className="btn-primary shine">
            <Icon name={busy ? 'loading' : 'signin'} size={18} className={busy ? 'animate-spin' : ''} />
            {busy ? 'Signing In…' : 'Sign In'}
          </button>
          <p className="text-center text-xs opacity-60">You stay signed in on this device until you log out.</p>
        </form>
      ) : sentTo ? (
        <div className="animate-scale-in space-y-4 text-center">
          <span className="icon-badge mx-auto h-14 w-14 bg-emerald-500/15 text-emerald-600"><Icon name="mail" size={28} /></span>
          <p className="font-semibold">Check Your Inbox</p>
          <p className="text-sm opacity-75">We sent a password reset link to <strong>{maskEmail(sentTo)}</strong>. If you do not see it, look in your spam folder.</p>
          <button type="button" onClick={() => switchMode('login')} className="btn-primary">Back To Sign In</button>
        </div>
      ) : (
        <form onSubmit={submitForgot} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fid" className="mb-1 block text-sm font-semibold">Unique ID</label>
            <input id="fid" name="grantly-reset-id" autoComplete="off" className="field" value={id} onChange={(e) => setId(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="Your Unique ID" />
          </div>
          {err && <p role="alert" className="animate-scale-in flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300"><Icon name="warning" size={16} className="mt-0.5 shrink-0" />{err}</p>}
          <button type="submit" disabled={busy} className="btn-primary shine">
            <Icon name={busy ? 'loading' : 'mail'} size={18} className={busy ? 'animate-spin' : ''} />
            {busy ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}