import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, Target, Bookmark, ClipboardList, FileText, Bell,
  User, Settings, HelpCircle, ShieldCheck, LogOut, Menu, X, Moon, Sun,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Logo from './Logo'
import Avatar from '../pages/Avatar'

const PORTAL = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scholarships', label: 'Explore Scholarships', icon: Search },
  { to: '/eligibility', label: 'Smart Eligibility', icon: Target },
  { to: '/saved', label: 'Saved Scholarships', icon: Bookmark },
  { to: '/applications', label: 'My Applications', icon: ClipboardList },
  { to: '/documents', label: 'My Documents', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
]
const ACCOUNT = [
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
]

function NavItem({ to, label, icon: Icon, onNavigate, badge }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
          isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'
        }`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">{badge}</span>}
    </NavLink>
  )
}

function Sidebar({ onNavigate }) {
  const { isAdmin, unreadCount, logout } = useApp()
  const navigate = useNavigate()
  const signOut = async () => { onNavigate?.(); await logout(); navigate('/', { replace: true }) }
  return (
    <div className="flex h-full flex-col bg-[#1f1e1d] text-white">
      <div className="px-4 pb-2 pt-5">
        {/* Light card behind the logo and name so the blue logo stands out on the dark sidebar */}
        <Link
          to="/dashboard"
          onClick={onNavigate}
          aria-label="Grantly home"
          className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10 transition-colors hover:bg-white/10"
        >
          {/* Cream tile behind the logo only; the rest of the card stays dark */}
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f3ead8] shadow-sm ring-1 ring-[#e3d5b8]">
            <Logo size={34} tile={false} className="transition-transform group-hover:scale-110" />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-[1.65rem] font-semibold leading-none tracking-wide text-[#faf9f5]">Grantly</span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#e3926f]">Scholarship Portal</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-4" aria-label="Main">
        <p className="mb-2 mt-4 px-3 text-sm font-semibold text-white/50">Student Portal</p>
        <div className="space-y-1">
          {PORTAL.map((i) => <NavItem key={i.to} {...i} onNavigate={onNavigate} badge={i.to === '/notifications' ? unreadCount : 0} />)}
        </div>
        <p className="mb-2 mt-8 px-3 text-sm font-semibold text-white/50">Account</p>
        <div className="space-y-1">
          {ACCOUNT.map((i) => <NavItem key={i.to} {...i} onNavigate={onNavigate} />)}
          {isAdmin && <NavItem to="/admin" label="Admin" icon={ShieldCheck} onNavigate={onNavigate} />}
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white">
            <LogOut size={20} aria-hidden="true" /> Log Out
          </button>
        </div>
      </nav>
    </div>
  )
}

export default function Layout({ children }) {
  const { user, theme, setTheme, unreadCount } = useApp()
  const [open, setOpen] = useState(false)
  const dark = theme === 'dark'

  return (
    <div className="min-h-screen lg:pl-72">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block"><Sidebar /></aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="animate-slide-right absolute inset-y-0 left-0 w-72 max-w-[85%]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10"><X size={20} /></button>
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-[#e8e6dc] bg-white/95 px-4 backdrop-blur dark:border-[#3d3d3a] dark:bg-[#30302e]/95 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8e6dc] dark:border-[#3d3d3a] lg:hidden"><Menu size={20} /></button>
          <p className="truncate text-[15px] opacity-80 sm:text-base">Hello, <span className="font-semibold opacity-100">{user?.name || 'Student'}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-11 w-11 place-items-center rounded-xl border border-[#e8e6dc] hover:bg-black/5 dark:border-[#3d3d3a] dark:hover:bg-white/10"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/notifications" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-xl border border-[#e8e6dc] hover:bg-black/5 dark:border-[#3d3d3a] dark:hover:bg-white/10">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
          {/* Profile photo when one is uploaded, otherwise the initials */}
          <Link to="/profile" aria-label="My profile" className="rounded-full">
            <Avatar user={user} size={44} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  )
}