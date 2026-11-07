export const EDUCATION_LEVELS = ['Diploma', 'Undergraduate', 'Postgraduate']
export const CATEGORIES = ['Merit Based', 'Need Based', 'Government', 'Private']
export const STUDENT_CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']
export const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
export const STATUSES = ['Not Started', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected']
export const DOC_TYPES = [
  'Aadhaar Card', 'Income Certificate', 'Caste Certificate',
  'Marksheet', 'Bank Passbook', 'Domicile Certificate',
]
// A document is "Pending" until a real file has been uploaded, then it becomes "Uploaded".
export const DOC_STATUS = { PENDING: 'Pending', UPLOADED: 'Uploaded' }
export const DOC_MAX_BYTES = 5 * 1024 * 1024 // 5 MB per file, stored in Supabase Storage

// Smart filter: which documents a student needs depends on their category.
const BASE_DOCS = ['Aadhaar Card', 'Marksheet', 'Bank Passbook', 'Domicile Certificate']
export const DOC_REASONS = {
  'Aadhaar Card': 'Identity proof needed for almost every scholarship',
  'Marksheet': 'Proof of your latest academic result',
  'Bank Passbook': 'Scholarship money is paid to this bank account',
  'Domicile Certificate': 'Proof of residence for state-linked schemes',
  'Caste Certificate': 'Needed for OBC, SC and ST category scholarships',
  'Income Certificate': 'Needed for schemes with a family income limit',
}
export function getDocRequirements(category) {
  if (!category) return { known: false, required: [...DOC_TYPES], optional: [], notApplicable: [] }
  const needsCaste = ['OBC', 'SC', 'ST'].includes(category)
  const needsIncome = category !== 'General' // OBC, SC, ST and EWS schemes check income
  const required = DOC_TYPES.filter((d) => BASE_DOCS.includes(d) || (d === 'Caste Certificate' && needsCaste) || (d === 'Income Certificate' && needsIncome))
  const optional = needsIncome ? [] : ['Income Certificate']
  const notApplicable = DOC_TYPES.filter((d) => !required.includes(d) && !optional.includes(d))
  return { known: true, required, optional, notApplicable }
}
export const DOC_ACCEPT = 'application/pdf,image/jpeg,image/png'
// Unique ID: 4 to 20 letters, numbers or underscores (stored in lower case)
export const UNIQUE_ID_RE = /^[a-z0-9_]{4,20}$/
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
// Fields that make up a completed profile
export const PROFILE_FIELDS = [
  'name', 'phone', 'state', 'educationLevel', 'course',
  'institution', 'percentage', 'income', 'category',
]