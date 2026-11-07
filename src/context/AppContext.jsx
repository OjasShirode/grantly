import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile, sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, onValue, set, update, remove, push, get, runTransaction } from 'firebase/database'
import { auth, db, googleProvider } from '../firebase'
import { supabase, supabaseConfigured, DOC_BUCKET, AVATAR_BUCKET } from '../supabase'
import { daysLeft } from '../utils/eligibility'
import { load, save } from '../utils/storage'
import { DOC_TYPES, DOC_STATUS, DOC_MAX_BYTES, UNIQUE_ID_RE, AVATAR_MAX_BYTES } from '../data/constants'
import { nationalScholarships } from '../data/nationalScholarships'

const AppContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)

const emptyProfile = {
  name: '', email: '', phone: '', state: '', educationLevel: '', course: '',
  institution: '', percentage: '', income: '', category: '',
  uniqueId: '', photoUrl: '', photoPath: '',
}

const normId = (s) => String(s || '').trim().toLowerCase()

// The ONE list that decides "profile complete %". Dashboard and Profile both read it from here,
// and the profile photo counts: uploading adds its share, removing the photo takes it away.
const COMPLETION_FIELDS = [
  'name', 'phone', 'state', 'educationLevel', 'course', 'institution',
  'percentage', 'income', 'category', 'photoUrl',
]

// Shrink the picture so it stays small, but NEVER crop it: the whole photo (full face) is kept
// and keeps its original proportions. The avatar circle shows it with object-fit: contain.
const resizeToSquare = (file, maxSide = 800) => new Promise((resolve, reject) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(url)
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process the image'))), 'image/jpeg', 0.9)
  }
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a valid image')) }
  img.src = url
})

const toList = (obj) => Object.entries(obj || {}).map(([id, v]) => ({ id, ...v }))

// Scholarship search filters. They are a device-side view preference and are
// NEVER written to the student's profile, so clearing them cannot erase profile data.
const emptyFilters = { query: '', type: '', education: '', state: '', category: '', maxIncome: '', sort: '' }
// Fields in the profile that can never be changed through updateUser
const LOCKED_PROFILE_FIELDS = ['uid', 'email', 'createdAt', 'uniqueId']

export function AppProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined) // undefined = still checking
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [saved, setSaved] = useState({})
  const [applicationsRaw, setApplicationsRaw] = useState({})
  const [documents, setDocuments] = useState({})
  const [notificationsRaw, setNotificationsRaw] = useState({})
  const [scholarshipsRaw, setScholarshipsRaw] = useState({})
  const [scholarshipsLoaded, setScholarshipsLoaded] = useState(false)
  const [stats, setStats] = useState({ students: 0, applications: 0 })
  const [isAdmin, setIsAdmin] = useState(false)
  const [online, setOnline] = useState(true)
  const [theme, setTheme] = useState(() => load('theme', 'light'))
  const [filters, setFiltersState] = useState(emptyFilters)
  const [, setTick] = useState(0)

  // Theme (only device-level preference stays local)
  useEffect(() => {
    save('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Re-render every minute so countdowns / urgency stay live
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 60000); return () => clearInterval(t) }, [])

  // Auth state
  useEffect(() => {
    if (!auth) { setAuthUser(null); return }
    return onAuthStateChanged(auth, (u) => setAuthUser(u))
  }, [])

  // Public live data: scholarships, stats, connection state
  useEffect(() => {
    if (!db) { setScholarshipsLoaded(true); return }
    const offs = [
      onValue(ref(db, 'scholarships'), (s) => { setScholarshipsRaw(s.val() || {}); setScholarshipsLoaded(true) }, () => setScholarshipsLoaded(true)),
      onValue(ref(db, 'stats'), (s) => setStats({ students: 0, applications: 0, ...(s.val() || {}) })),
      onValue(ref(db, '.info/connected'), (s) => setOnline(!!s.val())),
    ]
    return () => offs.forEach((off) => off())
  }, [])

  // Private live data for the signed-in student
  useEffect(() => {
    if (!db || !authUser) {
      setProfile(null); setProfileLoaded(false); setSaved({}); setApplicationsRaw({})
      setDocuments({}); setNotificationsRaw({}); setIsAdmin(false)
      return
    }
    const base = `users/${authUser.uid}`
    const offs = [
      onValue(ref(db, `${base}/profile`), (s) => { setProfile(s.val()); setProfileLoaded(true) }),
      onValue(ref(db, `${base}/saved`), (s) => setSaved(s.val() || {})),
      onValue(ref(db, `${base}/applications`), (s) => setApplicationsRaw(s.val() || {})),
      onValue(ref(db, `${base}/documents`), (s) => setDocuments(s.val() || {})),
      onValue(ref(db, `${base}/notifications`), (s) => setNotificationsRaw(s.val() || {})),
      onValue(ref(db, `admins/${authUser.uid}`), (s) => setIsAdmin(s.val() === true), () => setIsAdmin(false)),
    ]
    return () => offs.forEach((off) => off())
  }, [authUser])

  const uid = authUser?.uid
  const path = (p) => ref(db, `users/${uid}/${p}`)

  // Restore this student's saved filters when they sign in (kept apart from the profile)
  useEffect(() => {
    setFiltersState(uid ? { ...emptyFilters, ...load(`filters_${uid}`, {}) } : emptyFilters)
  }, [uid])

  const pushNotification = useCallback((type, text, extra = {}) => {
    if (!db || !uid) return
    return push(ref(db, `users/${uid}/notifications`), { type, text, time: Date.now(), read: false, ...extra })
  }, [uid])

  // ---------- Auth ----------
  // Unique ID: stored at usernames/{id} = { uid, email }. This lets people sign in with the ID.
  // 'invalid' = wrong format, 'taken' = already used, 'available' = free to use.
  const checkUniqueId = useCallback(async (raw) => {
    const id = normId(raw)
    if (!UNIQUE_ID_RE.test(id)) return 'invalid'
    const snap = await get(ref(db, `usernames/${id}`))
    return snap.exists() ? 'taken' : 'available'
  }, [])
  // Turns a Unique ID (or an email) into the email Firebase needs
  const resolveEmail = async (idOrEmail) => {
    const v = String(idOrEmail || '').trim()
    if (v.includes('@')) return v
    const snap = await get(ref(db, `usernames/${normId(v)}`))
    if (!snap.exists()) throw Object.assign(new Error('No account found with that Unique ID'), { code: 'app/id-not-found' })
    return snap.val().email
  }

  const register = async (data, password) => {
    data = { ...data, uniqueId: normId(data.uniqueId), email: String(data.email || '').trim() }
    if ((await checkUniqueId(data.uniqueId)) !== 'available') {
      throw Object.assign(new Error('That Unique ID is not available'), { code: 'app/id-taken' })
    }
    try { sessionStorage.setItem('grantly_new', '1') } catch { /* ignore */ }
    const cred = await createUserWithEmailAndPassword(auth, data.email, password)
    // Claim the ID. The database rules only allow this when nobody else has it.
    try {
      await set(ref(db, `usernames/${data.uniqueId}`), { uid: cred.user.uid, email: data.email })
    } catch {
      await cred.user.delete().catch(() => {})
      try { sessionStorage.removeItem('grantly_new') } catch { /* ignore */ }
      throw Object.assign(new Error('That Unique ID was just taken'), { code: 'app/id-taken' })
    }
    await updateProfile(cred.user, { displayName: data.name })
    // Password lives only in Firebase Authentication — never in the database.
    await set(ref(db, `users/${cred.user.uid}/profile`), { ...emptyProfile, ...data, uid: cred.user.uid, createdAt: Date.now() })
    await push(ref(db, `users/${cred.user.uid}/notifications`), { type: 'new', text: 'Welcome to GRANTLY! Check your matches in Smart Eligibility.', time: Date.now(), read: false })
    runTransaction(ref(db, 'stats/students'), (n) => (n || 0) + 1).catch(() => {})
  }
  // Sign in with the Unique ID (an email address also works)
  const login = async (idOrEmail, password) => signInWithEmailAndPassword(auth, await resolveEmail(idOrEmail), password)
  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider)
    const snap = await get(ref(db, `users/${user.uid}/profile`))
    if (!snap.exists()) {
      await set(ref(db, `users/${user.uid}/profile`), { ...emptyProfile, name: user.displayName || '', email: user.email || '', uid: user.uid, createdAt: Date.now() })
      runTransaction(ref(db, 'stats/students'), (n) => (n || 0) + 1).catch(() => {})
      return { isNew: true }
    }
    return { isNew: false }
  }
  // Same Firebase reset email as before, now also accepting the Unique ID. Returns the address it was sent to.
  const resetPassword = async (idOrEmail) => {
    const email = await resolveEmail(idOrEmail)
    await sendPasswordResetEmail(auth, email)
    return email
  }
  const logout = () => signOut(auth)

  // ---------- Profile ----------
  // Profile data is permanent: registration details are stored once and only ever
  // changed on purpose from the Profile page. Undefined values and locked fields are ignored.
  const updateUser = (patch) => {
    const clean = Object.fromEntries(
      Object.entries(patch || {}).filter(([k, v]) => v !== undefined && !LOCKED_PROFILE_FIELDS.includes(k)),
    )
    if (!Object.keys(clean).length) return Promise.resolve()
    return update(path('profile'), clean)
  }

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    const filled = COMPLETION_FIELDS.filter((f) => String(profile[f] ?? '').trim() !== '').length
    return Math.round((filled / COMPLETION_FIELDS.length) * 100)
  }, [profile])

  // ---------- Profile picture (stored in Supabase, link kept on the profile) ----------
  const uploadAvatar = async (file) => {
    if (!file) return
    if (!supabaseConfigured) { toast.error('File storage is not set up yet'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Choose a JPG, PNG or WebP picture'); return }
    if (file.size > AVATAR_MAX_BYTES) { toast.error('Picture is too large. Maximum size is 5 MB'); return }
    try {
      const blob = await resizeToSquare(file)
      const filePath = `${uid}/avatar-${Date.now()}.jpg`
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, blob, { contentType: 'image/jpeg', upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
      const previous = profile?.photoPath
      await updateUser({ photoUrl: data.publicUrl, photoPath: filePath })
      if (previous) supabase.storage.from(AVATAR_BUCKET).remove([previous]).catch(() => {})
      toast.success('Profile photo updated')
    } catch (e) {
      toast.error(e?.message ? `Upload failed: ${e.message}` : 'Upload failed. Please try again')
    }
  }
  const removeAvatar = async () => {
    if (profile?.photoPath && supabase) await supabase.storage.from(AVATAR_BUCKET).remove([profile.photoPath]).catch(() => {})
    await updateUser({ photoUrl: '', photoPath: '' })
    toast('Profile photo removed')
  }

  // ---------- Filters (separate from the profile) ----------
  const setFilters = (patch) => setFiltersState((prev) => {
    const next = { ...prev, ...patch }
    if (uid) save(`filters_${uid}`, next)
    return next
  })
  const resetFilters = () => { setFiltersState(emptyFilters); if (uid) save(`filters_${uid}`, emptyFilters) }

  // ---------- Saved ----------
  const isSaved = (id) => !!saved[id]
  const toggleSaved = (id) => {
    if (saved[id]) { remove(path(`saved/${id}`)); toast('Removed from saved') }
    else { set(path(`saved/${id}`), true); toast.success('Scholarship saved') }
  }

  // ---------- Applications ----------
  const applications = useMemo(
    () => toList(applicationsRaw).map((a) => ({ ...a, scholarshipId: a.id, history: Array.isArray(a.history) ? a.history : Object.values(a.history || {}) })),
    [applicationsRaw],
  )
  const getApplication = (id) => applications.find((a) => a.scholarshipId === id)
  const scholarshipName = (id) => scholarshipsRaw[id]?.name || 'scholarship'

  const addApplication = async (id) => {
    if (getApplication(id)) { toast('Already in your tracker'); return }
    await set(path(`applications/${id}`), { status: 'Not Started', notes: '', history: [{ status: 'Not Started', at: Date.now() }] })
    runTransaction(ref(db, 'stats/applications'), (n) => (n || 0) + 1).catch(() => {})
    pushNotification('update', `Added "${scholarshipName(id)}" to your tracker.`)
    toast.success('Added to tracker')
  }
  const updateStatus = async (id, status) => {
    const app = getApplication(id)
    if (!app || app.status === status) return
    await update(path(`applications/${id}`), { status, history: [...app.history, { status, at: Date.now() }] })
    pushNotification('update', `Status of "${scholarshipName(id)}" changed to ${status}.`)
    toast.success(`Status: ${status}`)
  }
  const updateNotes = (id, notes) => update(path(`applications/${id}`), { notes })
  const removeApplication = (id) => { remove(path(`applications/${id}`)); toast('Removed from tracker') }

  // ---------- Documents ----------
  // documents/{name} holds metadata only; the file itself lives in documentFiles/{name}
  // so the live listener never downloads every file. Old string values are still understood.
  const documentDetails = useMemo(() => Object.fromEntries(DOC_TYPES.map((d) => {
    const v = documents[d]
    if (v && typeof v === 'object') return [d, { status: DOC_STATUS.UPLOADED, ...v }]
    return [d, { status: v === 'Completed' || v === DOC_STATUS.UPLOADED ? DOC_STATUS.UPLOADED : DOC_STATUS.PENDING }]
  })), [documents])
  const docMap = useMemo(() => Object.fromEntries(DOC_TYPES.map((d) => [d, documentDetails[d].status])), [documentDetails])
  const setDocStatus = (name, status) => set(path(`documents/${name}`), status)

  // The complete original file goes to Supabase Storage; only its details are kept in Firebase.
  const uploadDocument = async (name, file) => {
    if (!file) return
    if (!supabaseConfigured) { toast.error('File storage is not set up yet. Add the Supabase keys to .env'); return }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { toast.error('Upload a PDF, JPG or PNG file'); return }
    if (file.size > DOC_MAX_BYTES) { toast.error(`File is too large. Maximum size is ${Math.round(DOC_MAX_BYTES / 1024 / 1024)} MB`); return }
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const filePath = `${uid}/${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error } = await supabase.storage.from(DOC_BUCKET).upload(filePath, file, { contentType: file.type, upsert: false })
      if (error) throw error
      const previous = documentDetails[name]?.path
      await set(path(`documents/${name}`), {
        status: DOC_STATUS.UPLOADED, fileName: file.name, fileType: file.type, size: file.size, path: filePath, uploadedAt: Date.now(),
      })
      if (previous) supabase.storage.from(DOC_BUCKET).remove([previous]).catch(() => {})
      pushNotification('update', `Your ${name} was uploaded.`)
      toast.success(`${name} uploaded`)
    } catch (e) {
      toast.error(e?.message ? `Upload failed: ${e.message}` : 'Upload failed. Please try again')
    }
  }
  const removeDocument = async (name) => {
    const filePath = documentDetails[name]?.path
    if (filePath && supabase) await supabase.storage.from(DOC_BUCKET).remove([filePath]).catch(() => {})
    await remove(path(`documents/${name}`))
    toast('Document removed. Status is pending again')
  }
  // Short-lived secure link to the stored file (view, or force a download)
  const getDocumentUrl = async (name, download = false) => {
    const d = documentDetails[name]
    if (!d?.path || !supabase) return null
    const { data, error } = await supabase.storage.from(DOC_BUCKET).createSignedUrl(d.path, 300, download ? { download: d.fileName || true } : undefined)
    return error ? null : data.signedUrl
  }

  // ---------- Notifications ----------
  const notifications = useMemo(() => toList(notificationsRaw).sort((a, b) => b.time - a.time), [notificationsRaw])
  const markRead = (id) => update(path(`notifications/${id}`), { read: true })
  const markAllRead = () => {
    const patch = {}
    notifications.forEach((n) => { if (!n.read) patch[`${n.id}/read`] = true })
    if (Object.keys(patch).length) update(path('notifications'), patch)
  }

  // ---------- Scholarships (live) ----------
  // Built-in nationwide online scholarships + anything admins publish live in Firebase.
  const scholarships = useMemo(() => {
    const live = toList(scholarshipsRaw)
    const liveIds = new Set(live.map((s) => s.id))
    return [...nationalScholarships.filter((s) => !liveIds.has(s.id)), ...live]
  }, [scholarshipsRaw])
  const getScholarship = (id) => scholarships.find((s) => s.id === id)

  const addScholarship = (data) => push(ref(db, 'scholarships'), { ...data, createdAt: Date.now() })
  const deleteScholarship = (id) => remove(ref(db, `scholarships/${id}`))

  // Live deadline alerts for saved / tracked scholarships
  const deadlineAlerts = scholarships
    .filter((s) => (saved[s.id] || applicationsRaw[s.id]) && s.deadline && daysLeft(s.deadline) >= 0 && daysLeft(s.deadline) <= 7)
    .map((s) => ({ id: 'd' + s.id, type: 'deadline', text: `"${s.name}" closes in ${daysLeft(s.deadline)} day(s).`, scholarshipId: s.id }))

  const unreadCount = notifications.filter((n) => !n.read).length + deadlineAlerts.length

  const clearMyData = async () => {
    await remove(ref(db, `users/${uid}/saved`)); await remove(path('applications'))
    const filePaths = Object.values(documents).map((d) => d?.path).filter(Boolean)
    if (filePaths.length && supabase) await supabase.storage.from(DOC_BUCKET).remove(filePaths).catch(() => {})
    await remove(path('documents')); await remove(path('notifications'))
    // The profile is intentionally kept: it is the student's registration record.
  }

  const value = {
    authUser, user: profile ? { ...profile } : null, profileLoaded, authReady: authUser !== undefined,
    register, login, loginWithGoogle, resetPassword, logout, updateUser, clearMyData,
    saved: Object.keys(saved), isSaved, toggleSaved,
    applications, getApplication, addApplication, updateStatus, updateNotes, removeApplication,
    profileCompletion, uploadAvatar, removeAvatar, checkUniqueId, filters, setFilters, resetFilters,
    documents: docMap, documentDetails, setDocStatus, uploadDocument, removeDocument, getDocumentUrl,
    notifications, markRead, markAllRead, deadlineAlerts, unreadCount,
    scholarships, scholarshipsLoaded, getScholarship, addScholarship, deleteScholarship,
    stats, isAdmin, online, theme, setTheme,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}