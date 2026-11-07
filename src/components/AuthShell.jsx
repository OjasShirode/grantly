import { Link } from 'react-router-dom'
import Logo from './Logo'
import Icon from './Icon'

const POINTS = [
  { icon: 'scholarship', text: 'Discover scholarships from across India' },
  { icon: 'target', text: 'Check your eligibility in seconds' },
  { icon: 'applications', text: 'Track every application in one place' },
  { icon: 'documents', text: 'Keep your documents ready and safe' },
]

// Shared layout for Login and Register. Two columns on large screens, a single column on
// phones and tablets, and it also copes with short landscape screens.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell grid min-h-screen lg:grid-cols-2">
      <aside className="gradient-brand relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" aria-hidden="true" />
        <div className="blob absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" style={{ animationDelay: '-5s' }} aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-3">
          <Logo size={44} />
          <span className="text-2xl font-extrabold tracking-wide">Grantly</span>
        </Link>
        <div className="relative">
          <h2 className="animate-fade-up text-4xl font-extrabold leading-tight xl:text-5xl">Find The Scholarship<br />That Fits You</h2>
          <ul className="stagger mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-lg">
                <span className="icon-badge h-10 w-10 bg-white/15"><Icon name={p.icon} size={20} /></span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm opacity-80">Scholarship discovery and management, built for students.</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="animate-fade-up w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <Logo size={36} />
            <span className="text-xl font-extrabold">Grantly</span>
          </Link>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm opacity-70">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <p className="mt-5 text-center text-sm">{footer}</p>}
        </div>
      </main>
    </div>
  )
}