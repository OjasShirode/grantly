// Central place for the site's professional icons (Lucide, outline style).
// Use <Icon name="search" /> anywhere an emoji used to be.
import {
  GraduationCap, Search, Bookmark, ClipboardList, FolderOpen, Bell, User, Settings, HelpCircle,
  ShieldCheck, LayoutDashboard, Award, IndianRupee, Calendar, Clock, MapPin, Building2, BookOpen,
  CheckCircle2, XCircle, AlertTriangle, Upload, FileText, Trash2, Eye, Download, Sparkles, TrendingUp,
  Users, Target, LogOut, Sun, Moon, ExternalLink, Filter, Heart, Mail, Phone, Lock, ChevronRight, Menu, X,
  Fingerprint, Landmark, Wallet, Home, FileCheck2, Loader2, RefreshCw, Plus, Info,
  Camera, EyeOff, UserPlus, LogIn, KeyRound, Check, BadgeCheck,
} from 'lucide-react'

const icons = {
  logo: GraduationCap, scholarship: Award, search: Search, saved: Bookmark, applications: ClipboardList,
  documents: FolderOpen, notifications: Bell, profile: User, settings: Settings, help: HelpCircle,
  admin: ShieldCheck, dashboard: LayoutDashboard, money: IndianRupee, date: Calendar, time: Clock,
  location: MapPin, institution: Building2, course: BookOpen, success: CheckCircle2, error: XCircle,
  warning: AlertTriangle, upload: Upload, file: FileText, delete: Trash2, view: Eye, download: Download,
  spark: Sparkles, growth: TrendingUp, students: Users, target: Target, logout: LogOut, sun: Sun, moon: Moon,
  external: ExternalLink, filter: Filter, like: Heart, mail: Mail, phone: Phone, lock: Lock, next: ChevronRight,
  menu: Menu, close: X, aadhaar: Fingerprint, bank: Landmark, income: Wallet, home: Home, verified: FileCheck2,
  loading: Loader2, refresh: RefreshCw, add: Plus, info: Info,
  camera: Camera, hide: EyeOff, signup: UserPlus, signin: LogIn, key: KeyRound, check: Check, id: BadgeCheck,
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.9, ...rest }) {
  const Cmp = icons[name] || Info
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" {...rest} />
}   