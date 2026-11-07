# GRANTLY – Real-time Scholarship Discovery & Management

React + Vite + Tailwind v4 + Framer Motion, backed by **Firebase Authentication** and **Realtime Database**.

## Setup (10 minutes)
1. Firebase Console → create a project → add a **Web app** → copy the config.
2. **Authentication** → Sign-in method → enable **Email/Password** and **Google**.
3. **Realtime Database** → Create database → **Rules** tab → paste `database.rules.json` → Publish.
4. Copy `.env.example` to `.env` and paste your keys. Restart the dev server.
5. `npm install && npm run dev`
6. Register an account, then make it an admin: in Realtime Database add
   `admins/<your-uid>: true` (your UID is under Authentication → Users).
7. Open **Admin** in the sidebar and publish real scholarships (form or JSON import, see `seed/scholarships.template.json`).

## Data model (Realtime Database)
```
scholarships/{id}              public read, admin write
users/{uid}/profile            student details (no passwords)
users/{uid}/saved/{id}
users/{uid}/applications/{id}  status, notes, history[]
users/{uid}/documents/{name}   Uploaded | Pending | Not Required
users/{uid}/notifications/{id}
stats/students, stats/applications   live counters
admins/{uid}                   true (set manually in console)
```
Passwords are stored only by Firebase Authentication (hashed). They are never written to the database.

## Real-time behaviour
Scholarships, stats, profile, saved items, applications, documents, notifications and connection status all use `onValue` listeners, so changes appear instantly across tabs and devices. Deadline countdowns re-evaluate every minute.

## Deploy
Add the same `VITE_FIREBASE_*` variables in Vercel/Netlify project settings. In Firebase Authentication → Settings → Authorized domains, add your deployed domain.
