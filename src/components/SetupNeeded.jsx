import Logo from './Logo'

export default function SetupNeeded() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-navy-950 to-brand-700 p-4">
      <div className="glass w-full max-w-xl rounded-2xl p-8">
        <Logo />
        <h1 className="mt-5 text-2xl font-extrabold text-navy-900 dark:text-white">Connect Firebase to continue</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">GRANTLY stores accounts and live data in Firebase. Create a <code>.env</code> file in the project root (copy <code>.env.example</code>) and fill in your Firebase web-app keys, then restart <code>npm run dev</code>.</p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Firebase Console → create project → add a Web app → copy config.</li>
          <li>Build → Authentication → enable Email/Password and Google.</li>
          <li>Build → Realtime Database → create database → paste <code>database.rules.json</code> into Rules.</li>
          <li>Paste the keys into <code>.env</code> and restart.</li>
        </ol>
      </div>
    </div>
  )
}
