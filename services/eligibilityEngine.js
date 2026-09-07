// Yojna Saathi - Part 5: deterministic (rule-based) eligibility engine.
// Combines user/voice profile + OCR document evidence.
// Three states per scheme: eligible | not_eligible | more_info_needed.
// Documents stay optional unless a scheme specifically requires a specific document.

const { resolveEvidence, documentTypePresent, hasValue } = require('./evidenceResolver');

// Derives which profile fields are needed to decide a scheme, from its rules.
function requiredFieldsForRules(rules) {
  const req = [];
  if (Array.isArray(rules.occupation) && rules.occupation.length) req.push('occupation');
  if (typeof rules.ageMin === 'number' || typeof rules.ageMax === 'number') req.push('age');
  if (typeof rules.incomeMax === 'number') req.push('income');
  if (rules.gender && rules.gender !== 'all') req.push('gender');
  if (rules.category && rules.category !== 'all') req.push('category');
  return req;
}

// Maps a document type to the profile field it can confirm (evidence).
const DOC_FIELD_EVIDENCE = {
  income_certificate: 'income',
  caste_certificate: 'category',
  bpl_certificate: 'income',
  aadhaar: 'age'
};

// Schemes that specifically require a particular evidence document.
const REQUIRED_EVIDENCE = {
  'sc-st-pre-matric': ['caste_certificate'],
  'stand-up-india': ['caste_certificate'],
  'janani-suraksha': ['bpl_certificate']
};

function normalizeIncome(v) {
  const n = parseFloat(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalizeAge(v) {
  if (hasValue(v)) {
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function norm(v) {
  return String(v == null ? '' : v).toLowerCase().trim();
}

// Evaluate one scheme deterministically.
// Returns { status, reasons, missingFields, requiredEvidenceMissing, evidenceUsed, conflicts }
function evaluateScheme(scheme, resolved, sources, conflicts, docs) {
  const rules = scheme.eligibilityRules || {};
  const reasons = [];
  const missingFields = [];
  const evidenceUsed = [];
  let status = 'eligible';

  const age = normalizeAge(resolved.age);
  const income = normalizeIncome(resolved.income);
  const gender = resolved.gender; // preserves raw casing for display
  const occupation = resolved.occupation;
  const category = resolved.category;

  const required = requiredFieldsForRules(rules);

  // --- age bounds ---
  if (required.includes('age')) {
    if (age === null) {
      if (status === 'eligible') status = 'more_info_needed';
      missingFields.push({ field: 'age', source: sources.age || null });
    } else {
      evidenceUsed.push({ field: 'age', value: age, source: sources.age || 'user' });
      if (typeof rules.ageMin === 'number' && age < rules.ageMin) {
        status = 'not_eligible';
        reasons.push(`Umar kam se kam ${rules.ageMin} saal honi chahiye`);
      }
      if (typeof rules.ageMax === 'number' && age > rules.ageMax) {
        status = 'not_eligible';
        reasons.push(`Umar ${rules.ageMax} saal se zyada nahi honi chahiye`);
      }
    }
  }

  // --- gender ---
  if (required.includes('gender')) {
    if (!hasValue(gender)) {
      if (status === 'eligible') status = 'more_info_needed';
      missingFields.push({ field: 'gender', source: sources.gender || null });
    } else {
      evidenceUsed.push({ field: 'gender', value: gender, source: sources.gender || 'user' });
      if (norm(gender) !== norm(rules.gender)) {
        status = 'not_eligible';
        reasons.push(rules.gender === 'female'
          ? 'Yeh yojana kewal mahilaon ke liye hai'
          : 'Yeh yojana kewal purushon ke liye hai');
      }
    }
  }

  // --- category ---
  if (required.includes('category')) {
    if (!hasValue(category)) {
      if (status === 'eligible') status = 'more_info_needed';
      missingFields.push({ field: 'category', source: sources.category || null });
    } else {
      evidenceUsed.push({ field: 'category', value: category, source: sources.category || 'user' });
      const allowed = String(rules.category).split('/').map(c => norm(c));
      if (!allowed.includes(norm(category))) {
        status = 'not_eligible';
        reasons.push(`Yeh yojana ${String(rules.category).toUpperCase()} ke liye hai`);
      }
    }
  }

  // --- occupation ---
  if (required.includes('occupation')) {
    if (!hasValue(occupation)) {
      if (status === 'eligible') status = 'more_info_needed';
      missingFields.push({ field: 'occupation', source: sources.occupation || null });
    } else {
      evidenceUsed.push({ field: 'occupation', value: occupation, source: sources.occupation || 'user' });
      const allowed = rules.occupation.map(o => norm(o));
      if (!allowed.includes(norm(occupation))) {
        status = 'not_eligible';
        reasons.push(`Yeh yojana ${rules.occupation.join(' ya ')} ke liye hai`);
      }
    }
  }

  // --- income ---
  if (required.includes('income')) {
    if (income === null) {
      if (status === 'eligible') status = 'more_info_needed';
      missingFields.push({ field: 'income', source: sources.income || null });
    } else {
      evidenceUsed.push({ field: 'income', value: income, source: sources.income || 'user' });
      if (typeof rules.incomeMax === 'number' && income > rules.incomeMax) {
        status = 'not_eligible';
        reasons.push(`Aay ₹${(rules.incomeMax / 1000).toFixed(0)} lakh se kam honi chahiye`);
      }
    }
  }

  // --- specifically required evidence documents ---
  const docEvidenceMap = {};
  docs.forEach(d => { docEvidenceMap[d.type] = true; });
  const requiredEvidence = REQUIRED_EVIDENCE[scheme.id] || [];
  const requiredEvidenceMissing = [];
  requiredEvidence.forEach(docType => {
    const fieldForDoc = DOC_FIELD_EVIDENCE[docType];
    if (fieldForDoc && hasValue(resolved[fieldForDoc])) {
      // The decisive field is already provided by user; doc stays optional.
      return;
    }
    if (documentTypePresent(docs, docType)) {
      // Document confirms an otherwise-missing field; status stays whatever it was.
    } else {
      if (status === 'eligible') status = 'more_info_needed';
      requiredEvidenceMissing.push(docType);
    }
  });

  return { status, reasons, missingFields, requiredEvidenceMissing, evidenceUsed, conflicts };
}

// Main entry: preserve v1 signature for backward compatibility.
// opts { requestedId } triggers alternative-scheme computation.
function checkEligibility(profile, schemes, opts) {
  opts = opts || {};
  const ev = resolveEvidence(profile);
  const { resolved, sources, conflicts, documents } = ev;

  const results = [];
  for (const scheme of schemes) {
    if (scheme.status !== 'active') continue;
    const evalRes = evaluateScheme(scheme, resolved, sources, conflicts, documents);

    let matchLevel = 'not_eligible';
    if (evalRes.status === 'eligible') {
      const evidenceCount = evalRes.evidenceUsed.length;
      matchLevel = evidenceCount >= 3 ? 'likely_eligible' : evidenceCount >= 1 ? 'possibly_eligible' : 'check_eligibility';
    } else if (evalRes.status === 'more_info_needed') {
      matchLevel = 'check_eligibility';
    }

    results.push({
      scheme,
      eligible: evalRes.status === 'eligible',
      matchLevel,
      status: evalRes.status,
      reasons: evalRes.status === 'eligible' ? [] : evalRes.reasons,
      missingFields: evalRes.missingFields,
      requiredEvidenceMissing: evalRes.requiredEvidenceMissing,
      evidenceUsed: evalRes.evidenceUsed,
      conflicts: evalRes.conflicts,
      message: buildMessage(evalRes)
    });
  }

  results.sort((a, b) => {
    const order = { likely_eligible: 0, possibly_eligible: 1, check_eligibility: 2, not_eligible: 3 };
    return order[a.matchLevel] - order[b.matchLevel];
  });

  // Backward-compatible: no requestedId => return the results array as before.
  if (!opts.requestedId) return results;

  const requested = results.find(r => r.scheme.id === opts.requestedId) || null;
  return {
    results,
    conflicts,
    requested,
    alternatives: buildAlternatives(requested, results)
  };
}

function buildMessage(r) {
  if (r.status === 'eligible') return 'Aap is yojna ke liye patr hain.';
  if (r.status === 'more_info_needed') {
    const parts = [];
    r.missingFields.forEach(m => parts.push(fieldLabel(m.field)));
    r.requiredEvidenceMissing.forEach(t => parts.push(`praman-patr: ${t}`));
    if (parts.length) return `Aur jaankari chahiye: ${parts.join(', ')}`;
    if (r.conflicts.length) return 'Kuch jaankari meaning clear nahi hai, kripya verify karein.';
    return 'Is yojna ke liye kuch aur jaankari chahiye.';
  }
  return r.reasons.length ? r.reasons.join('; ') : 'Aap abhi is yojna ke liye patr nahi hain.';
}

function fieldLabel(f) {
  const labels = { age: 'umra', gender: 'ling', occupation: 'vyavsay', income: 'aay', category: 'shreni', state: 'rajya' };
  return labels[f] || f;
}

// If the requested scheme is not eligible, surface alternative eligible schemes (same/nearby category).
function buildAlternatives(requested, results) {
  if (!requested) return [];
  if (requested.status === 'eligible') return [];
  const requestedId = requested.scheme.id;
  const category = requested.scheme.category;
  const others = results.filter(r => r.scheme.id !== requestedId);

  const sameCategory = others.filter(r => r.eligible && r.scheme.category === category);
  const anyone = others.filter(r => r.eligible);
  const picked = (sameCategory.length ? sameCategory : anyone).slice(0, 3);

  return picked.map(r => ({
    id: r.scheme.id,
    name: r.scheme.name,
    category: r.scheme.category,
    benefit: r.scheme.benefit,
    eligibilityRules: r.scheme.eligibilityRules,
    officialApplicationUrl: r.scheme.officialApplicationUrl,
    officialSourceUrl: r.scheme.officialSourceUrl,
    lastVerified: r.scheme.lastVerified,
    requiredDocuments: r.scheme.requiredDocuments,
    matchLevel: r.matchLevel,
    reasons: r.reasons,
    evidenceUsed: r.evidenceUsed
  }));
}

module.exports = { checkEligibility, evaluateScheme, resolveEvidence };