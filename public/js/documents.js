// Yojna Saathi - Part 4: optional document upload + type selection + OCR extraction
// "दस्तावेज़ मदद करें, लेकिन दस्तावेज़ देना जरूरी नहीं है।"

const DOC_TYPE_DEFS = [
  { id: 'aadhaar', icon: '🪪', labelKey: 'aadhaar_card' },
  { id: 'income', icon: '💰', labelKey: 'income_certificate' },
  { id: 'caste', icon: '📜', labelKey: 'caste_certificate' },
  { id: 'domicile', icon: '🏠', labelKey: 'residence_certificate' },
  { id: 'disability', icon: '♿', labelKey: 'disability_certificate' },
  { id: 'student', icon: '🎓', labelKey: 'student_id' },
  { id: 'land', icon: '🌾', labelKey: 'land_farmer_document' },
  { id: 'bank', icon: '🏦', labelKey: 'bank_document' },
  { id: 'ration', icon: '🍚', labelKey: 'ration_card' },
  { id: 'other', icon: '📄', labelKey: 'other_document' }
];

const SENSITIVE_FIELDS = ['aadhaar'];
const DOC_FIELD_LABELS = {
  name: 'doc_field_name', dob: 'doc_field_dob', gender: 'doc_field_gender',
  state: 'doc_field_state', district: 'doc_field_district', address: 'doc_field_address',
  income: 'doc_field_income', category: 'doc_field_category', occupation: 'doc_field_occupation',
  aadhaar: 'doc_field_aadhaar'
};

let docUploadedDocs = [];

function docTypeLabel(id) {
  const def = DOC_TYPE_DEFS.find(d => d.id === id);
  return def ? t(def.labelKey) : t('other_document');
}

function updateDocUI() {
  const list = document.querySelector('[data-doc-list]');
  if (list && typeof renderDocFiles === 'function') renderDocFiles();
}

function openDocModal() {
  const modal = document.getElementById('docModal');
  if (!modal) return;
  showDocTypeStep();
  modal.style.display = 'flex';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t('add_document'));
  document.body.style.overflow = 'hidden';
  renderDocTypeGrid();
  const first = modal.querySelector('#docTypeGrid button');
  if (first) first.focus();
}

function closeDocModal() {
  const modal = document.getElementById('docModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function closeDocModalBackdrop(e) {
  if (e.target === document.getElementById('docModal')) closeDocModal();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('docModal');
    if (modal && modal.style.display === 'flex') closeDocModal();
  }
});

function showDocStep(name) {
  ['docStepTypes', 'docStepFile', 'docStepLoading', 'docStepResult'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === name) ? '' : 'none';
  });
}

function showDocTypeStep() {
  showDocStep('docStepTypes');
  renderDocTypeGrid();
}

function renderDocTypeGrid() {
  const grid = document.getElementById('docTypeGrid');
  if (!grid) return;
  grid.innerHTML = DOC_TYPE_DEFS.map(d => `
    <button type="button" class="doc-type-card" onclick="startDocUpload('${d.id}')"
            data-doc-type="${d.id}" aria-label="${docTypeLabel(d.id)}">
      <span class="doc-type-icon">${d.icon}</span>
      <span class="doc-type-label">${docTypeLabel(d.id)}</span>
    </button>
  `).join('');
}

function startDocUpload(id) {
  docSelectedType = id;
  const label = document.getElementById('docSelectedTypeLabel');
  if (label) label.textContent = `${t('choose_document_type')} • ${docTypeLabel(id)}`;
  showDocStep('docStepFile');
  const first = document.querySelector('#docUploadActions button');
  if (first) first.focus();
}

let docSelectedType = 'other';

function handleDocFile(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  uploadDocAsync(file);
}

async function uploadDocAsync(file) {
  const type = docSelectedType || 'other';
  docSelectedFileName = file.name || docTypeLabel(type);
  docSelectedFileSize = file.size || '';
  showDocStep('docStepLoading');
  const loadingText = document.getElementById('docLoadingText');
  const stages = [t('reading_document'), t('extracting_information'), t('checking_information')];
  let stage = 0;
  const stageTimer = setInterval(() => {
    stage = Math.min(stage + 1, stages.length - 1);
    if (loadingText && docModalLoading()) loadingText.textContent = stages[stage];
  }, 700);

  const fd = new FormData();
  fd.append('document', file);
  fd.append('documentType', type);

  let data = null;
  let ok = false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch('/api/upload', { method: 'POST', body: fd, signal: controller.signal });
    clearTimeout(timer);
    ok = res.ok;
    data = await res.json();
  } catch (err) {
    ok = false;
  }
  clearInterval(stageTimer);

  if (!ok || !data || data.success === false) {
    showDocStep('docStepTypes');
    showToast(t('document_failed'));
    return;
  }
  renderDocResult(type, data);
}

function docModalLoading() {
  const el = document.getElementById('docStepLoading');
  return !!(el && el.style.display !== 'none');
}

function formatFieldValue(field, value) {
  if (value === null || value === undefined || value === '') return '';
  if (field === 'gender') {
    const g = value === 'male' ? 'male' : value === 'female' ? 'female' : value;
    return t(g);
  }
  if (field === 'occupation') {
    const map = { kisan: t('kisan'), student: t('vidyarthi'), naukri: t('rojgar'), vyavasaya: t('business'), mazdoor: 'Mazdoor', retired: 'Retired', other: 'Other' };
    return map[value] || value;
  }
  if (field === 'category') return String(value).toUpperCase();
  if (field === 'income') return '₹' + value;
  return value;
}

function renderDocResult(type, data) {
  const fields = data.fields || data.extractedFields || {};
  const editable = fieldEditableMap(fields);
  docResultFields = editable;

  const fieldConfidence = data.fieldConfidence || {};
  const demo = !!data.demo;
  docResultDemo = demo;

  const demoNote = document.getElementById('docDemoNote');
  if (demoNote) demoNote.style.display = demo ? '' : 'none';

  const notStored = document.getElementById('docNotStored');
  if (notStored) notStored.style.display = SENSITIVE_FIELDS.some(f => docHasValue(fields[f])) ? '' : 'none';

  const title = document.getElementById('docResultTitle');
  if (title) title.textContent = t('extracted_information') + ' • ' + docTypeLabel(type);
  const hint = document.getElementById('docResultHint');
  if (hint) hint.textContent = t('please_check_information');

  renderDocMismatches(editable, type);

  const container = document.getElementById('docFields');
  const keys = Object.keys(editable).filter(k => docHasValue(editable[k]));
  container.innerHTML = keys.map(k => `
    <div class="doc-field-row">
      <label for="docField_${k}" class="doc-field-label">${t(DOC_FIELD_LABELS[k] || k)}</label>
      <div class="doc-field-control">
        ${renderFieldInput(k, editable[k])}
        <div class="doc-field-conf">${cellConfidenceText(k, fieldConfidence)}</div>
      </div>
    </div>
  `).join('');

  showDocStep('docStepResult');
}

function docHasValue(v) {
  return v !== null && v !== undefined && v !== '';
}

function renderDocMismatches(fields, type) {
  const wrap = document.getElementById('docMismatchList');
  if (!wrap) return;
  const profile = userProfile || {};
  const map = { income: 'income', category: 'category', gender: 'gender', state: 'state', occupation: 'occupation' };
  const rows = [];
  Object.keys(fields).forEach(k => {
    const target = map[k];
    if (!target) return;
    const docVal = fields[k];
    const userVal = profile[target];
    if (!docHasValue(docVal)) return;
    if (!docHasValue(userVal)) return;
    if (String(userVal) === String(docVal)) return;
    rows.push({ field: k, userValue: userVal, docValue: docVal });
  });
  if (rows.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  // Never use the word "fake" - always gentle "verify" wording
  wrap.innerHTML = rows.map(r => `
    <div class="mismatch-warning doc-mismatch-row" role="status">
      <strong>⚠️ ${t('information_difference')} (${t(DOC_FIELD_LABELS[r.field] || r.field)})</strong>
      <div class="doc-mismatch-detail">
        ${t('doc_keep_value')}: <b>${escapeHtml(formatFieldValue(r.field, r.userValue))}</b><br>
        ${t('doc_apply_value')}: <b>${escapeHtml(formatFieldValue(r.field, r.docValue))}</b>
      </div>
      <div class="doc-mismatch-hint">${t('please_verify')}</div>
    </div>
  `).join('');
}

function fieldEditableMap(fields) {
  const out = {};
  Object.keys(DOC_FIELD_LABELS).forEach(k => {
    if (docHasValue(fields[k])) out[k] = fields[k];
  });
  return out;
}

function renderFieldInput(k, value) {
  if (k === 'gender') {
    const male = value === 'male';
    const female = value === 'female';
    return `
      <select id="docField_${k}" class="form-control doc-field-input">
        <option value="male" ${male ? 'selected' : ''}>${t('male')}</option>
        <option value="female" ${female ? 'selected' : ''}>${t('female')}</option>
      </select>`;
  }
  if (k === 'category') {
    const opts = [['general', 'General'], ['obc', 'OBC'], ['sc', 'SC'], ['st', 'ST'], ['ews', 'EWS']];
    return `<select id="docField_${k}" class="form-control doc-field-input">
      ${opts.map(([v, l]) => `<option value="${v}" ${String(value).toLowerCase() === v ? 'selected' : ''}>${l}</option>`).join('')}
    </select>`;
  }
  if (k === 'income') {
    const val = parseInt(value, 10);
    const opts = [['100000', '₹1 Lakh se kam'], ['200000', '₹1-2 Lakh'], ['300000', '₹2-3 Lakh'], ['500000', '₹3-5 Lakh'], ['800000', '₹5-8 Lakh'], ['1000000', '₹8-10 Lakh']];
    return `<select id="docField_${k}" class="form-control doc-field-input">
      ${opts.map(([v, l]) => `<option value="${v}" ${val === parseInt(v, 10) ? 'selected' : ''}>${l}</option>`).join('')}
    </select>`;
  }
  if (k === 'occupation') {
    const map = [['kisan', t('kisan')], ['student', t('vidyarthi')], ['naukri', t('rojgar')], ['vyavasaya', t('business')], ['mazdoor', 'Mazdoor'], ['retired', 'Retired'], ['other', 'Other']];
    return `<select id="docField_${k}" class="form-control doc-field-input">
      ${map.map(([v, l]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${l}</option>`).join('')}
    </select>`;
  }
  if (k === 'dob') {
    return `<input id="docField_${k}" class="form-control doc-field-input" type="date" value="${escapeAttr(value)}">`;
  }
  if (k === 'aadhaar') {
    return `<input id="docField_${k}" class="form-control doc-field-input" type="text" value="${escapeAttr(value)}" inputmode="numeric" maxlength="14" aria-label="${t('doc_field_aadhaar')}">`;
  }
  return `<input id="docField_${k}" class="form-control doc-field-input" type="text" value="${escapeAttr(value)}" aria-label="${t(DOC_FIELD_LABELS[k] || k)}">`;
}

function cellConfidenceText(k, fieldConfidence) {
  const c = fieldConfidence && fieldConfidence[k];
  if (c && c !== null && c !== undefined) {
    const v = Number(c.confidence !== undefined ? c.confidence : c);
    if (v >= 0.7) return t('information_is_clear');
    if (v > 0) return t('information_needs_review');
  }
  if (c && c.value === null) return '';
  return '';
}

function escapeAttr(s) {
  return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
}

function collectDocFields() {
  const out = {};
  Object.keys(docResultFields || {}).forEach(k => {
    const el = document.getElementById('docField_' + k);
    out[k] = el ? el.value : docResultFields[k];
    if (out[k] === '') delete out[k];
  });
  return out;
}

function applyDocResult() {
  if (!docResultFields) return;
  const final = collectDocFields();
  const doc = {
    id: 'doc_' + Date.now(),
    type: docSelectedType,
    name: docSelectedFileName || docTypeLabel(docSelectedType),
    size: docSelectedFileSize || '',
    status: 'processed',
    extracted: { ...final },
    demo: docResultDemo
  };
  docUploadedDocs.push(doc);
  renderDocFiles();
  closeDocModal();
  applyDocToProfile(doc);
  showToast(t('document_added'));
}

function applyDocToProfile(doc) {
  const fields = doc.extracted || {};
  const existing = userProfile || {};
  const warnings = [];

  Object.keys(fields).forEach(k => {
    if (k === 'aadhaar' || k === 'address' || k === 'district' || k === 'dob') {
      // sensitive/detail fields: use in this session only, never persist
      userProfile[k] = fields[k];
      return;
    }
    const map = {
      income: 'income', category: 'category', gender: 'gender',
      state: 'state', occupation: 'occupation', name: 'name', dob: 'dob'
    };
    if (!map[k]) return;
    const target = map[k];
    const docVal = fields[k];
    if (!docHasValue(docVal)) return;
    if (!docHasValue(existing[target])) {
      userProfile[target] = docVal;
    } else if (String(existing[target]) !== String(docVal)) {
      userProfile['conflicts'] = userProfile['conflicts'] || [];
      userProfile['conflicts'].push({ field: target, userValue: existing[target], docValue: docVal });
    }
  });
}

function renderDocFiles() {
  const container = document.querySelector('[data-doc-list]');
  if (!container) return;
  const nonSensitive = docUploadedDocs.map(d => ({
    ...d,
    extracted: Object.keys(d.extracted || {}).filter(k => k !== 'aadhaar').reduce((o, k) => { o[k] = d.extracted[k]; return o; }, {})
  }));
  container.innerHTML = nonSensitive.map((d, i) => `
    <div class="file-item doc-file-item">
      <span>${DOC_TYPE_DEFS.find(x => x.id === d.type) ? DOC_TYPE_DEFS.find(x => x.id === d.type).icon : '📄'}</span>
      <span class="file-name">${escapeHtml(d.name)}</span>
      <span class="file-status">${d.status === 'processed' ? '✓' : d.status === 'error' ? '✗' : '…'}</span>
      <span class="file-remove" onclick="removeDocFile(${i})" aria-label="${t('remove_document')}" title="${t('remove_document')}">✕</span>
    </div>
  `).join('');
}

function releaseDocFile(docId) {
  docUploadedDocs = docUploadedDocs.filter(d => d.id !== docId);
  renderDocFiles();
}

function removeDocFile(i) {
  docUploadedDocs.splice(i, 1);
  renderDocFiles();
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function skipDocuments() {
  closeDocModal();
}

let docResultFields = null;
let docResultDemo = false;
let docSelectedFileName = '';
let docSelectedFileSize = '';