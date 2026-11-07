// Nationwide scholarships applied for ONLINE through the National Scholarship Portal (NSP)
// or the scheme's own official portal. Available to eligible students in every state/UT.
//
// Data policy: only facts confirmed from public pages are filled in. Where amount,
// income limit or marks were not confirmed they are left null (the UI hides them and the
// eligibility engine skips that criterion). Deadlines are left null because NSP cycles
// change every year — students must confirm the current window on the official portal.

const NSP = 'https://scholarships.gov.in/'
const AICTE = 'https://www.aicte-india.org/schemes/students-development-schemes'
const ALL_CATS = ['General', 'OBC', 'SC', 'ST', 'EWS']
const CHECK = ' Check the current amount, income limit and dates on the official portal before applying.'

const base = {
  type: 'Government', state: 'All India', amountNote: '', deadline: null,
  documents: ['Aadhaar Card', 'Marksheet', 'Bank Passbook'],
  benefits: [], process: ['Register or log in on the official portal', 'Fill in the application and upload documents', 'Submit and note the application ID'],
  featured: false, builtin: true,
}

export const nationalScholarships = [
  {
    ...base, id: 'aicte-pragati', featured: true,
    name: 'AICTE Pragati Scholarship for Girl Students', provider: 'AICTE (Ministry of Education)',
    category: 'Need Based', amount: 50000, amountNote: '/ year', incomeLimit: 800000, minPercentage: null,
    education: ['Diploma', 'Undergraduate'], allowedCategories: ALL_CATS, officialUrl: AICTE,
    description: 'For girl students admitted to a diploma or degree technical course at an AICTE-approved institution. Maximum two girl children per family; no other scholarship for the same purpose. Applications are made on NSP.',
    documents: ['Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
    benefits: ['₹50,000 per year via Direct Benefit Transfer'],
  },
  {
    ...base, id: 'aicte-saksham',
    name: 'AICTE Saksham Scholarship (Specially-abled Students)', provider: 'AICTE (Ministry of Education)',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Diploma', 'Undergraduate'], allowedCategories: ALL_CATS, officialUrl: AICTE,
    description: 'Scholarship for specially-abled students pursuing diploma or degree technical courses.' + CHECK,
    documents: ['Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'aicte-swanath',
    name: 'AICTE Swanath Scholarship', provider: 'AICTE (Ministry of Education)',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Diploma', 'Undergraduate'], allowedCategories: ALL_CATS, officialUrl: AICTE,
    description: 'AICTE scholarship for diploma and degree students from specific disadvantaged backgrounds.' + CHECK,
  },
  {
    ...base, id: 'pm-usp-csss', featured: true,
    name: 'PM-USP Central Sector Scheme of Scholarship (CSSS)', provider: 'Department of Higher Education, Ministry of Education',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Central sector scholarship for college and university students under PM-USP, applied for via the National Scholarship Portal.' + CHECK,
    documents: ['Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'ugc-pg-national',
    name: 'UGC National Scholarship for Postgraduate Studies', provider: 'University Grants Commission',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'UGC scholarship for postgraduate students, applied for via the National Scholarship Portal.' + CHECK,
  },
  {
    ...base, id: 'top-class-sc', featured: true,
    name: 'Top Class Education Scheme for SC Students', provider: 'Ministry of Social Justice and Empowerment',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ['SC'], officialUrl: NSP,
    description: 'Central sector scheme for Scheduled Caste students at notified top-class institutions.' + CHECK,
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'nfsc',
    name: 'National Fellowship for Scheduled Caste Students (NFSC)', provider: 'Ministry of Social Justice and Empowerment',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Postgraduate'], allowedCategories: ['SC'], officialUrl: NSP,
    description: 'Fellowship for Scheduled Caste students pursuing higher studies and research.' + CHECK,
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'pm-yasasvi-college',
    name: 'PM YASASVI Top Class Education (Colleges)', provider: 'Ministry of Social Justice and Empowerment',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ['OBC'], officialUrl: NSP,
    description: 'For OBC, EBC and DNT students in notified top-class colleges. (EBC/DNT applicants: confirm your category on the official portal.)' + CHECK,
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'st-national-fellowship',
    name: 'National Fellowship and Scholarship for Higher Education of ST Students', provider: 'Ministry of Tribal Affairs',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Postgraduate'], allowedCategories: ['ST'], officialUrl: NSP,
    description: 'Support for Scheduled Tribe students pursuing higher education.' + CHECK,
    documents: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Passbook', 'Aadhaar Card'],
  },
  {
    ...base, id: 'icar-ug-talent',
    name: 'ICAR National Talent Scholarship (Undergraduate)', provider: 'ICAR (Dept. of Agricultural Research and Education)',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Talent scholarship for undergraduate agriculture-stream students.' + CHECK,
  },
  {
    ...base, id: 'icar-pg',
    name: 'ICAR Postgraduate Scholarship', provider: 'ICAR (Dept. of Agricultural Research and Education)',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Scholarship for postgraduate agriculture-stream students.' + CHECK,
  },
  {
    ...base, id: 'nec-merit',
    name: 'NEC Merit Scholarship', provider: 'North Eastern Council (Ministry of DoNER)',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: [], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Merit scholarship for students from the North Eastern Region.' + CHECK,
  },
  {
    ...base, id: 'ishan-uday',
    name: 'Ishan Uday Special Scholarship (North Eastern Region)', provider: 'Ministry of Education',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Special scholarship scheme for students of the North Eastern Region.' + CHECK,
  },
  {
    ...base, id: 'pm-scholarship-capf',
    name: 'PM Scholarship for Central Armed Police Forces and Assam Rifles', provider: 'Ministry of Home Affairs',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'For wards and widows of CAPF and Assam Rifles personnel.' + CHECK,
  },
  {
    ...base, id: 'pm-scholarship-railways',
    name: 'PM Scholarship for Ministry of Railways', provider: 'Ministry of Railways',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Scholarship scheme for eligible wards of Railways personnel.' + CHECK,
  },
  {
    ...base, id: 'isi-kolkata-stipend',
    name: 'ISI Kolkata Stipend (UG & PG)', provider: 'Ministry of Statistics and Programme Implementation',
    category: 'Merit Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Undergraduate', 'Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Stipend for undergraduate and postgraduate students studying at the Indian Statistical Institute, Kolkata.' + CHECK,
  },
  {
    ...base, id: 'disability-post-matric',
    name: 'Post-Matric Scholarship for Students with Disabilities', provider: 'Dept. of Empowerment of Persons with Disabilities',
    category: 'Need Based', amount: null, incomeLimit: null, minPercentage: null,
    education: ['Diploma', 'Undergraduate', 'Postgraduate'], allowedCategories: ALL_CATS, officialUrl: NSP,
    description: 'Post-matric support for students with disabilities, applied for on NSP.' + CHECK,
  },
]