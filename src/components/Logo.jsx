import { useState } from 'react'

// The Grantly logo: your original /logo.png (file lives in the "public" folder).
// - tile (default): the logo sits on a cream rounded tile, so it is clear on any background.
// - If the picture ever fails to load, a "G" is shown instead of a broken-image icon.
export default function Logo({ size = 40, tile = true, className = '', ...rest }) {
  const [failed, setFailed] = useState(false)
  const pad = tile ? Math.max(3, Math.round(size * 0.14)) : 0
  const inner = size - pad * 2

  const picture = failed ? (
    <span
      className="grid place-items-center rounded-lg bg-[#c6613f] font-serif font-bold text-white"
      style={{ width: inner, height: inner, fontSize: Math.round(inner * 0.6) }}
      aria-label="Grantly"
    >G</span>
  ) : (
    <img
      src="/logo.png"
      alt="Grantly logo"
      draggable={false}
      onError={() => setFailed(true)}
      className="object-contain"
      style={{ width: inner, height: inner }}
      {...rest}
    />
  )

  if (!tile) return <span className={`inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>{picture}</span>

  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-xl bg-[#f3ead8] shadow-sm ring-1 ring-[#e3d5b8] ${className}`}
      style={{ width: size, height: size }}
    >
      {picture}
    </span>
  )
}