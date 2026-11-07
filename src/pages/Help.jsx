import { useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Field, inputCls, btnPrimary, card } from '../components/ui'

const faqs = [
  ['Are these real scholarships?', 'No. All scholarships in this prototype are clearly labelled sample data. Always verify rules and deadlines with the official provider.'],
  ['How does eligibility matching work?', 'A rule-based engine compares your education level, score, income, category and state with each scholarship and explains every result.'],
  ['Where is my data stored?', 'Only in your browser\'s LocalStorage. Nothing is sent to a server.'],
  ['What do the deadline colours mean?', 'Red: within 3 days. Orange: within 7 days. Green: more than 7 days. These are display hints, not official rules.'],
]

export default function Help() {
  const [msg, setMsg] = useState({ subject: '', message: '', type: 'Support' })
  const submit = (e) => {
    e.preventDefault()
    toast.success(msg.type === 'Feedback' ? 'Thanks for your feedback!' : 'Message sent (simulated)')
    setMsg({ subject: '', message: '', type: 'Support' })
  }
  return (
    <div className="max-w-3xl">
      <PageHeader title="Help & support" subtitle="FAQs, contact and feedback." />
      <section className="space-y-3" aria-label="FAQs">
        {faqs.map(([q, a]) => (
          <details key={q} className={`${card} p-4`}>
            <summary className="cursor-pointer font-semibold text-navy-900 dark:text-white">{q}</summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{a}</p>
          </details>
        ))}
      </section>
      <form onSubmit={submit} className={`${card} mt-6 space-y-4 p-5`}>
        <h2 className="font-bold text-navy-900 dark:text-white">Contact support or send feedback</h2>
        <Field label="Type" id="h-type"><select id="h-type" value={msg.type} onChange={(e) => setMsg({ ...msg, type: e.target.value })} className={inputCls}><option>Support</option><option>Feedback</option></select></Field>
        <Field label="Subject" id="h-sub"><input id="h-sub" required value={msg.subject} onChange={(e) => setMsg({ ...msg, subject: e.target.value })} className={inputCls} /></Field>
        <Field label="Message" id="h-msg"><textarea id="h-msg" rows={4} required value={msg.message} onChange={(e) => setMsg({ ...msg, message: e.target.value })} className={inputCls} /></Field>
        <button className={btnPrimary}>Send</button>
      </form>
    </div>
  )
}
