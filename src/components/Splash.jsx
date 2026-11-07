import { useEffect, useState } from 'react'
import Logo from './Logo'

const LETTERS = 'Grantly'.split('')

// Opening animation: the logo pops in, the name rises letter by letter, a progress line runs,
// then the whole screen fades away. Shown once per browser session (see App.jsx).
export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t1 = setTimeout(() => setLeaving(true), reduce ? 500 : 3000)
    const t2 = setTimeout(onDone, reduce ? 800 : 3600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`splash ${leaving ? 'splash-out' : ''}`} role="status" aria-label="Loading Grantly">
      <div className="splash-orbs" aria-hidden="true"><span /><span /><span /></div>
      <div className="splash-center">
        <div className="splash-logo">
          <span className="splash-ring" aria-hidden="true" />
          <Logo size={96} />
        </div>
        <h1 className="splash-name" aria-label="Grantly">
          {LETTERS.map((c, i) => <span key={i} aria-hidden="true" style={{ '--i': i }}>{c}</span>)}
        </h1>
        <p className="splash-tag">Scholarships Made Simple</p>
        <div className="splash-bar" aria-hidden="true"><i /></div>
      </div>
    </div>
  )
}