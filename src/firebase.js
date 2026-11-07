import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Values come from .env when present; the project's own web config is the fallback.
// (A Firebase web config is not a secret. Access is controlled by Authentication and Database rules.)
const env = import.meta.env
const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCCQah5WU9CX5W22hnn6hKb6O6aGB25AIQ',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'grantly-6d85c.firebaseapp.com',
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || 'https://grantly-6d85c-default-rtdb.firebaseio.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'grantly-6d85c',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'grantly-6d85c.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1042967489206',
  appId: env.VITE_FIREBASE_APP_ID || '1:1042967489206:web:5e093a04f4b1092abcd417',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K6BWPWHLV2',
}

export const firebaseConfigured = Boolean(cfg.apiKey && cfg.databaseURL && cfg.projectId)

const app = firebaseConfigured ? initializeApp(cfg) : null
export const auth = app ? getAuth(app) : null
// Session management: the sign-in is kept in this browser's local storage, so closing the
// browser or restarting the laptop keeps the student signed in until they press Logout.
if (auth) setPersistence(auth, browserLocalPersistence).catch(() => {})
export const db = app ? getDatabase(app) : null
export const googleProvider = new GoogleAuthProvider()

// Usage analytics (only where the browser supports it)
if (app && cfg.measurementId) isSupported().then((ok) => { if (ok) getAnalytics(app) }).catch(() => {})