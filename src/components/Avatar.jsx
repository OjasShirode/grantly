import { useEffect, useState } from 'react'

// Two-letter initials from a name, e.g. "Asha Patil" -> "AP"
export const initialsOf = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'S'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

// One avatar used everywhere (header, sidebar, profile page).
// - If the student uploaded a photo, the photo is shown.
// - Otherwise (or if the photo fails to load) their initials are shown.
// The photo uses object-fit: contain (see .avatar img in index.css), so the whole face is
// visible instead of a cropped half.
export default function Avatar({ user, size = 40, className = '' }) {
  const [broken, setBroken] = useState(false)
  const url = user?.photoUrl

  // Try again whenever the picture changes
  useEffect(() => { setBroken(false) }, [url])

  const showPhoto = Boolean(url) && !broken
  return (
    <span
      className={`avatar ${showPhoto ? 'has-photo' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) }}
      aria-label={user?.name ? `${user.name}'s profile picture` : 'Profile picture'}
      role="img"
    >
      {showPhoto
        ? <img src={url} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
        : initialsOf(user?.name)}
    </span>
  )
}