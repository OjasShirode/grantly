import { createClient } from '@supabase/supabase-js'

// The publishable key is designed to be used in the browser. Access is limited by the
// storage policies in supabase-setup.sql. Never put a secret key (sb_secret_...) in this app.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://ahfmlmhqphulsbtgvrka.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_40S8VuxAxuW4VBxgjlq4wA_lhiApmxr'

export const supabaseConfigured = Boolean(url && key)
// Supabase is used only for file storage. Sign-in stays with Firebase Authentication.
export const supabase = supabaseConfigured
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null
export const DOC_BUCKET = 'documents' // private: certificates and other originals
export const AVATAR_BUCKET = 'avatars' // public: profile pictures