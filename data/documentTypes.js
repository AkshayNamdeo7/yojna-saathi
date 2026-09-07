const DOCUMENT_TYPES = [
  { id: 'aadhaar', icon: '🪪', profileFields: ['name', 'dob', 'gender', 'state', 'district', 'address', 'aadhaar'] },
  { id: 'income', icon: '💰', profileFields: ['name', 'income'] },
  { id: 'caste', icon: '📜', profileFields: ['name', 'category'] },
  { id: 'domicile', icon: '🏠', profileFields: ['name', 'state', 'district', 'address'] },
  { id: 'disability', icon: '♿', profileFields: ['name'] },
  { id: 'student', icon: '🎓', profileFields: ['name', 'occupation'] },
  { id: 'land', icon: '🌾', profileFields: ['name', 'occupation'] },
  { id: 'bank', icon: '🏦', profileFields: ['name'] },
  { id: 'ration', icon: '🍚', profileFields: ['name', 'category', 'income'] },
  { id: 'other', icon: '📄', profileFields: ['name'] }
];

const DEMO_FIELDS_BY_TYPE = {
  aadhaar: {
    name: 'Mohan Kumar',
    dob: '1995-06-15',
    gender: 'male',
    address: 'Sadar Bazar, Indore, Madhya Pradesh 452001',
    state: 'Madhya Pradesh',
    district: 'Indore',
    aadhaar: 'XXXX-XXXX-1234'
  },
  income: { name: 'Mohan Kumar', income: 200000 },
  caste: { name: 'Mohan Kumar', category: 'obc' },
  domicile: {
    name: 'Mohan Kumar',
    state: 'Madhya Pradesh',
    district: 'Indore',
    address: 'Indore, Madhya Pradesh'
  },
  disability: { name: 'Mohan Kumar' },
  student: { name: 'Mohan Kumar', occupation: 'student' },
  land: { name: 'Mohan Kumar', occupation: 'kisan' },
  bank: { name: 'Mohan Kumar' },
  ration: { name: 'Mohan Kumar', category: 'obc', income: 200000 },
  other: { name: 'Mohan Kumar' }
};

const ALL_PROFILE_FIELDS = ['name', 'dob', 'gender', 'state', 'district', 'address', 'aadhaar', 'income', 'category', 'occupation'];

const SENSITIVE_FIELDS = ['aadhaar'];

function normalizeDocumentType(type) {
  if (!type) return 'other';
  const found = DOCUMENT_TYPES.find(d => d.id === String(type).toLowerCase());
  return found ? found.id : 'other';
}

module.exports = {
  DOCUMENT_TYPES,
  DEMO_FIELDS_BY_TYPE,
  ALL_PROFILE_FIELDS,
  SENSITIVE_FIELDS,
  normalizeDocumentType
};