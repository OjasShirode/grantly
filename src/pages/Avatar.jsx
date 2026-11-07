import { useEffect, useState } from 'react'

// Round profile picture. Shows the photo stored in Supabase, or the person's initials
// when there is no photo (or it cannot be loaded).
export default function Avatar({ user, size = 40, className = '' }) {
  const [broken, setBroken] = useState(false)
  useEffect(() => { setBroken(false) }, [user?.photoUrl])
  const initials = (user?.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'

  if (user?.photoUrl && !broken) {
    return (
      <img
        src={user.photoUrl} alt={user.name ? `${user.name}'s profile photo` : 'Profile photo'}
        width={size} height={size} loading="lazy" onError={() => setBroken(true)}
        className={`rounded-full object-cover ring-2 ring-white/70 ${className}`} style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={`gradient-brand inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={user?.name ? `${user.name}'s avatar` : 'Avatar'}
    >
      {initials}
    </span>
  )
}