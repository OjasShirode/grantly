// Rule-based eligibility engine with per-criterion reasons.
// Only criteria the scholarship actually defines are evaluated.
// Always confirm final rules with the official provider.

export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN')
const has = (v) => v !== '' && v != null && !Number.isNaN(v)

export function checkEligibility(student, s) {
  const criteria = []
  const edu = s.education || []
  const cats = s.allowedCategories || []

  if (student?.educationLevel && edu.length) {
    const ok = edu.includes(student.educationLevel)
    criteria.push({ key: 'education', label: 'Education level', ok, required: edu.join(' / '), actual: student.educationLevel,
      reason: ok ? `Open to ${student.educationLevel} students.` : `Only for ${edu.join(' / ')} students.` })
  }
  if (has(student?.percentage) && has(s.minPercentage)) {
    const ok = Number(student.percentage) >= Number(s.minPercentage)
    criteria.push({ key: 'academic', label: 'Academic performance', ok, required: `${s.minPercentage}% minimum`, actual: `${student.percentage}%`,
      reason: ok ? `Your ${student.percentage}% meets the ${s.minPercentage}% requirement.` : `You need at least ${s.minPercentage}% (you have ${student.percentage}%).` })
  }
  if (has(student?.income) && has(s.incomeLimit)) {
    const ok = Number(student.income) <= Number(s.incomeLimit)
    criteria.push({ key: 'income', label: 'Annual family income', ok, required: `Up to ${formatINR(s.incomeLimit)}`, actual: formatINR(student.income),
      reason: ok ? `Your income is within the ${formatINR(s.incomeLimit)} limit.` : `Family income must be ${formatINR(s.incomeLimit)} or less.` })
  }
  if (student?.category && cats.length) {
    const ok = cats.includes(student.category)
    criteria.push({ key: 'category', label: 'Category', ok, required: cats.join(', '), actual: student.category,
      reason: ok ? `${student.category} category is eligible.` : `Reserved for ${cats.join(', ')} categories.` })
  }
  if (student?.state && s.state && s.state !== 'All India') {
    const ok = student.state === s.state
    criteria.push({ key: 'state', label: 'State / domicile', ok, required: s.state, actual: student.state,
      reason: ok ? `Available in ${s.state}.` : `Only for residents of ${s.state}.` })
  }

  const matched = criteria.filter((c) => c.ok).length
  const total = criteria.length
  return { criteria, matched, total, eligible: total > 0 && matched === total, score: total ? Math.round((matched / total) * 100) : 0 }
}

export const evaluateAll = (student, list) => list.map((s) => ({ scholarship: s, result: checkEligibility(student, s) }))

// null when the scholarship has no published deadline
export function daysLeft(deadline) {
  if (!deadline) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(deadline + 'T00:00:00') - today) / 86400000)
}

// Suggested display rule (not official): red <=3d, orange <=7d, green otherwise
export function urgency(deadline) {
  const n = daysLeft(deadline)
  if (n === null) return { level: 'open', label: 'Check portal', cls: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' }
  if (n < 0) return { level: 'closed', label: 'Closed', cls: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400' }
  if (n <= 3) return { level: 'red', label: n === 0 ? 'Closes today' : `${n}d left`, cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' }
  if (n <= 7) return { level: 'orange', label: `${n}d left`, cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' }
  return { level: 'green', label: `${n}d left`, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' }
}

export function profileCompletion(u) {
  const fields = ['name', 'email', 'phone', 'state', 'educationLevel', 'course', 'institution', 'percentage', 'income', 'category']
  return Math.round((fields.filter((f) => has(u?.[f])).length / fields.length) * 100)
}
