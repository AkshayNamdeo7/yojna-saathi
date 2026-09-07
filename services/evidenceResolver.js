// Yojna Saathi - Part 5: deterministic evidence resolution (user profile + voice + OCR documents)
// Conflicts are flagged and surfaced; they are NEVER treated as fraud/fake.

const FIELD_SOURCES = {
  income: 'income',
  category: 'category',
  gender: 'gender',
  state: 'state',
  occupation: 'occupation',
  name: 'name',
  dob: 'dob',
  age: 'age'
};

function hasValue(v) {
  return v !== null && v !== undefined && v !== '' && v !== '—';
}

// Resolves the effective profile from user/voice profile + uploaded OCR document evidence.
// Returns { resolved, sources, conflicts, documents }
function resolveEvidence(profile) {
  profile = profile || {};
  const resolved = {};
  const sources = {};
  const conflicts = [];

  // 1. Start with user/voice-provided values.
  Object.keys(FIELD_SOURCES).forEach(k => {
    if (hasValue(profile[k])) {
      resolved[k] = profile[k];
      sources[k] = 'user';
    }
  });

  // 2. Merge document evidence for fields the user did NOT provide.
  const docs = Array.isArray(profile.documents) ? profile.documents : [];
  docs.forEach(doc => {
    if (!doc || !doc.fields || typeof doc.fields !== 'object') return;
    Object.keys(doc.fields).forEach(k => {
      if (!(k in FIELD_SOURCES)) return;
      const val = doc.fields[k];
      if (!hasValue(val)) return;
      if (!(k in resolved)) {
        resolved[k] = val;
        sources[k] = 'document';
      } else if (String(resolved[k]) !== String(val)) {
        // User-provided differs from document-extracted value.
        // Record as a conflict to be surfaced, never auto-reject.
        conflicts.push({ field: k, userValue: resolved[k], docValue: val });
        sources[k] = sources[k] === 'user' ? 'conflict' : sources[k];
      }
    });
  });

  return { profile, resolved, sources, conflicts, documents: docs };
}

function documentTypePresent(docs, requiredType) {
  return docs.some(d => d && d.type === requiredType && d.status === 'processed');
}

module.exports = { resolveEvidence, documentTypePresent, hasValue };