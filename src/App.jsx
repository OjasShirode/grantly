import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useApp } from './context/AppContext'
import { firebaseConfigured } from './firebase'
import Layout from './components/Layout'
import SetupNeeded from './components/SetupNeeded'
import Splash from './components/Splash'
import { Spinner } from './components/ui'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scholarships from './pages/Scholarships'
import ScholarshipDetails from './pages/ScholarshipDetails'
import Eligibility from './pages/Eligibility'
import Saved from './pages/Saved'
import Applications from './pages/Applications'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'
import Admin from './pages/Admin'

// Same structure as the original, one small addition: the page content sits in a wrapper that
// is re-created on every route change, which gives the quick, light fade when switching pages.
function Protected({ children, admin = false }) {
  const { authUser, authReady, user, profileLoaded, isAdmin } = useApp()
  const location = useLocation()
  if (!authReady || (authUser && !profileLoaded)) return <Spinner />
  // Remember where the person was heading so they land there after signing in
  if (!authUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!user) return <Spinner />
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />
  return (
    <Layout>
      <div key={location.pathname} className="page-fade">{children}</div>
    </Layout>
  )
}

// Home, Login and Register: a student with a live session goes straight into the app.
// Someone who has just registered is sent to Profile first to finish their details.
function PublicOnly({ children }) {
  const { authUser, authReady } = useApp()
  const location = useLocation()
  if (!authReady) return <Spinner />
  if (authUser) {
    let fresh = false
    try { fresh = !!sessionStorage.getItem('grantly_new') } catch { /* ignore */ }
    return <Navigate to={location.state?.from || (fresh ? '/profile' : '/dashboard')} replace />
  }
  return <div key={location.pathname} className="page-fade">{children}</div>
}

export default function App() {
  const { pathname } = useLocation()
  const { authUser, authReady, profileLoaded } = useApp()

  // The splash plays on every fresh open of the site. It stays up until its own animation has
  // finished and sign-in has been checked, so you go splash -> dashboard with no spinner flash.
  const [splash, setSplash] = useState(true)
  const [splashPlayed, setSplashPlayed] = useState(false)
  const endSplash = useCallback(() => setSplashPlayed(true), [])
  const appReady = authReady && (!authUser || profileLoaded)
  useEffect(() => { if (splashPlayed && appReady) setSplash(false) }, [splashPlayed, appReady])
  // Safety net: never leave the splash covering the app if something is slow
  useEffect(() => { const t = setTimeout(() => setSplash(false), 8000); return () => clearTimeout(t) }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  if (!firebaseConfigured) return <SetupNeeded />

  return (
    <>
      {splash && <Splash onDone={endSplash} />}
      <Routes>
        <Route path="/" element={<PublicOnly><Home /></PublicOnly>} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/scholarships" element={<Protected><Scholarships /></Protected>} />
        <Route path="/scholarships/:id" element={<Protected><ScholarshipDetails /></Protected>} />
        <Route path="/eligibility" element={<Protected><Eligibility /></Protected>} />
        <Route path="/saved" element={<Protected><Saved /></Protected>} />
        <Route path="/applications" element={<Protected><Applications /></Protected>} />
        <Route path="/documents" element={<Protected><Documents /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/help" element={<Protected><Help /></Protected>} />
        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}