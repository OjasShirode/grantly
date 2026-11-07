import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from '../pages/Avatar'
import Icon from './Icon'

// Upload / change / remove the profile picture. The file goes to Supabase and the link is
// saved on the profile, so it shows up again on any device after signing in.
export default function ProfilePhoto() {
  const { user, uploadAvatar, removeAvatar } = useApp()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    await uploadAvatar(file)
    setBusy(false)
    if (input.current) input.current.value = ''
  }
  const remove = async () => { setBusy(true); await removeAvatar(); setBusy(false) }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative">
        <Avatar user={user} size={112} className={busy ? 'opacity-50' : ''} />
        {busy && <span className="absolute inset-0 grid place-items-center"><Icon name="loading" size={28} className="animate-spin" /></span>}
        <button
          type="button" onClick={() => input.current?.click()} disabled={busy} aria-label="Change profile photo"
          className="gradient-brand animate-ring absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full text-white shadow-lg ring-2 ring-white dark:ring-[#262624]"
        >
          <Icon name="camera" size={16} />
        </button>
      </div>
      <div className="text-center sm:text-left">
        <p className="font-bold">Profile Photo</p>
        <p className="text-sm opacity-70">JPG, PNG or WebP. Your whole photo is kept and resized automatically, nothing is cut off.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-ghost"><Icon name="upload" size={16} />{user?.photoUrl ? 'Change Photo' : 'Upload Photo'}</button>
          {user?.photoUrl && <button type="button" onClick={remove} disabled={busy} className="btn-ghost text-rose-600"><Icon name="delete" size={16} />Remove</button>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}