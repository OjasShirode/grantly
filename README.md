# Grantly

**Scholarship discovery, eligibility checking and application tracking in one dashboard.**

🔗 **Live website:** [https://scholargrantly.vercel.app](https://scholargrantly.vercel.app/)

Grantly helps students find scholarships they can actually qualify for. A student creates a profile once, and the platform matches it against scholarship rules, explains why each scholarship is or is not a fit, keeps the required documents in one place, and tracks every application from start to decision.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [How the eligibility check works](#how-the-eligibility-check-works)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Firebase setup](#firebase-setup)
- [Supabase storage setup](#supabase-storage-setup)
- [Admin access](#admin-access)
- [Deployment on Vercel](#deployment-on-vercel)
- [Security notes](#security-notes)
- [Data disclaimer](#data-disclaimer)
- [Author](#author)

---

## Features

### Landing page
- Hero section with scholarship search by name or keyword
- Featured scholarships, live platform statistics and quick links to log in or register

### Accounts and student profile
- Registration with name, email, phone, a **Unique ID** and password
- Sign in with the **Unique ID** (an email address also works), with live availability check while choosing an ID
- Forgot-password flow that sends a reset link by email
- Sessions persist on the device until the student logs out
- Profile with personal details, education level, course, institution, latest percentage, state, category and annual family income
- Profile photo upload (JPG, PNG or WebP) shown in the header; initials are shown when there is no photo
- A single **profile completion** percentage, shared by the dashboard and the profile page, which also counts the profile photo

### Dashboard
- Personalised welcome and profile completion
- Counters for total scholarships, scholarships you are eligible for, saved scholarships and submitted applications
- Upcoming deadlines with colour-coded urgency
- Application overview chart
- Recommended scholarships and recent activity

### Scholarship explorer
- Search by name, provider or keyword
- Filters for scholarship type, education level, state, category and maximum income
- Sorting options
- Save (bookmark) scholarships for later
- Filters are remembered per student on the device and never overwrite profile data

### Scholarship details
- Provider, amount, eligibility rules, income limit, education level and deadline
- Required documents, benefits and step-by-step application process
- Link to the official website
- Actions: save, check eligibility and add to the application tracker

### Smart eligibility
- Compares the student's profile with each scholarship's rules
- Shows matching scholarships and the ones where criteria are not met
- Explains the reason for every result

### Application tracker
- Statuses: Not Started, In Progress, Submitted, Under Review, Approved, Rejected
- Visual timeline for every application
- Full status history with dates
- Personal notes for each application (reference IDs, contacts, to-dos)
- Filter applications by status

### Document manager
- Checklist for Aadhaar Card, Income Certificate, Caste Certificate, Marksheet, Bank Passbook and Domicile Certificate
- Shows only the documents that apply to the student's category
- Upload original files (PDF, JPG or PNG), then view, download, replace or remove them
- Files are stored in a private bucket and opened through short-lived secure links
- Progress bar for required documents

### Notifications
- Activity notifications for new accounts, tracker changes and document uploads
- Automatic deadline alerts for saved or tracked scholarships closing within 7 days
- Unread count, mark as read and mark all as read

### Settings and support
- Light and dark theme
- Help page
- Option to clear personal data (saved items, applications, documents and notifications) while keeping the account record

### Admin panel
- Publish new scholarships that appear instantly for all students
- Bulk import scholarships from a JSON array
- Delete scholarships that were published from the panel
- Only available to accounts marked as admin

### Interface
- Warm light and dark themes
- Responsive layout for phones, tablets, laptops and large screens
- Short page transitions and a splash screen on every fresh visit
- Keyboard-friendly forms with labelled fields
- Text selection and the right-click menu are disabled on the site (inputs and text areas remain selectable)

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | React with Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Icons | Lucide React |
| Charts | Recharts |
| Notifications | React Hot Toast |
| Authentication | Firebase Authentication |
| Database | Firebase Realtime Database (live updates) |
| File storage | Supabase Storage (profile photos and documents) |
| Hosting | Vercel |

Shared state is handled with React Context. Device-only preferences such as the theme and scholarship filters are kept in `localStorage`.

---

## How the eligibility check works

Eligibility is rule based, so every result can be explained. For each scholarship the engine compares the student's profile with the rules that scholarship defines:

- Education level
- State
- Student category
- Annual family income against the income limit
- Latest percentage against the minimum percentage

A scholarship is marked eligible when all of its defined rules are satisfied. Rules that a scholarship does not define are skipped. Each result lists which criteria matched and which did not, and the matches are used to rank the recommended scholarships on the dashboard.

---

## Project structure

```
grantly/
├── public/                  Static files (logo.png, favicon, icons)
├── seed/                    Template for bulk importing scholarships
├── src/
│   ├── components/          Layout, Logo, ProfilePhoto, AuthShell, Splash, shared UI
│   ├── context/             AppContext: auth, profile, data and actions
│   ├── data/                Constants and built-in scholarship data
│   ├── pages/               Home, Login, Register, Dashboard, Scholarships,
│   │                        ScholarshipDetails, Eligibility, Saved, Applications,
│   │                        Documents, Notifications, Profile, Settings, Help, Admin
│   ├── utils/               Eligibility engine and local storage helpers
│   ├── firebase.js          Firebase configuration
│   ├── supabase.js          Supabase client and bucket names
│   ├── App.jsx              Routes and protected pages
│   ├── main.jsx             Application entry point
│   └── index.css            Theme and global styles
├── database.rules.json      Firebase Realtime Database security rules
├── vercel.json              Rewrites so page refreshes work on Vercel
├── .env.example             Names of the environment variables
└── package.json
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A Firebase project (Authentication and Realtime Database)
- A Supabase project (Storage only)

### Installation

```bash
git clone https://github.com/OjasShirode/grantly.git
cd grantly
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

On Windows Command Prompt use `copy .env.example .env`.

The `.env` file holds your Firebase configuration values and the Supabase values `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The names of all required variables are listed in `.env.example`. Never commit your `.env` file.

### Run the app

```bash
npm run dev
```

Open the address shown in the terminal (by default `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

---

## Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Go to **Authentication → Sign-in method** and enable **Email/Password**.
3. Go to **Realtime Database** and create a database.
4. Open **Realtime Database → Rules** and publish the rules from `database.rules.json`. They make scholarships and statistics readable by everyone, keep each student's data private, and allow only the owner to claim a Unique ID.
5. Register a web app in **Project settings** and copy its configuration values into your `.env` file.
6. After deploying, add your site domain under **Authentication → Settings → Authorized domains**.

---

## Supabase storage setup

Supabase is used only for file storage. Sign-in stays with Firebase.

1. Create a project at [supabase.com](https://supabase.com/).
2. Go to **Storage** and create two buckets:
   - `avatars`, with **Public bucket** turned on (profile pictures)
   - `documents`, with **Public bucket** turned off (certificates and other originals)
3. In the **SQL Editor**, add storage policies so the app can read, upload and delete in those buckets:

```sql
create policy "avatars read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars upload" on storage.objects for insert with check (bucket_id = 'avatars');
create policy "avatars delete" on storage.objects for delete using (bucket_id = 'avatars');

create policy "documents read" on storage.objects for select using (bucket_id = 'documents');
create policy "documents upload" on storage.objects for insert with check (bucket_id = 'documents');
create policy "documents delete" on storage.objects for delete using (bucket_id = 'documents');
```

4. Copy the project URL and the publishable (anon) key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## Admin access

The admin panel is available at `/admin` only for accounts marked as admin. Admin status cannot be changed from inside the app.

To make an account an admin:

1. Sign in once with that account, then open Firebase Console → Authentication and copy the account's **User UID**.
2. In **Realtime Database**, add this entry:

```
admins
  └── <the user's UID>: true
```

After signing in again, the **Admin** item appears in the sidebar. From there you can publish scholarships one at a time or import several using the field names in `seed/scholarships.template.json`.

---

## Deployment on Vercel

1. Push the project to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use these settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add all variables from your `.env` file under **Environment Variables**.
5. Click **Deploy**.

`vercel.json` rewrites every route to `index.html`, so refreshing a page such as `/dashboard` works. Keep the file name `public/logo.png` in lowercase, because Vercel file names are case sensitive.

Every push to the `main` branch redeploys the site automatically.

---

## Security notes

- Passwords are handled only by Firebase Authentication and are never stored in the database.
- Each student can read and write only their own data. Scholarships are public to read and can be written only by admins.
- Documents are stored in a private bucket and opened through links that expire after a few minutes.
- The Supabase key used in the browser is a publishable key, which is designed to be public. Never put a Supabase secret key (`sb_secret_...`) in this project.
- Because sign-in is handled by Firebase and storage by Supabase, the storage policies above are open at the bucket level. For stricter per-user isolation, connect Firebase sign-in to Supabase as a third-party auth provider and limit each policy to the user's own folder.
- Do not upload or share real sensitive documents on a demo or test account.

---

## Data disclaimer

Eligibility results are guidance based on the rules stored for each scholarship, not an official decision. Scholarship rules, amounts and deadlines can change, so always confirm the details on the official scholarship website before applying. Only publish or import scholarship data that you have verified from the official source.

---

## Author

**Ojas Shirode**
GitHub: [@OjasShirode](https://github.com/OjasShirode)
