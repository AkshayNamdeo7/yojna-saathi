let userProfile = {};
let allSchemesData = [];
let uploadedDocs = [];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildLanguageGrids();
  populateBirthYears();
  populateStatesFilter();
  applyTranslations();
  wireHeaderButtons();
  loadServerTranslations(currentLang).then(() => {
    applyTranslations();
    updateOccupationOptions();
    buildLanguageGrids();
  });
});

function wireHeaderButtons() {
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.onclick = () => { document.getElementById('langModal').style.display = 'flex'; };
}

function openLangModal() {
  document.getElementById('langModal').style.display = 'flex';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'screen-home') applyTranslations();
  if (id === 'screen-schemes') loadAllSchemes();
}

function quickCategory(cat) {
  showScreen('screen-profile');
  const occupationMap = {
    kisan: 'kisan', vidyarthi: 'student', rojgar: 'naukri',
    swasthya: 'naukri', ghar: 'mazdoor', arthik_madad: 'vyavasaya'
  };
  if (occupationMap[cat]) {
    const occSel = document.getElementById('profileOccupation');
    if (occSel) occSel.value = occupationMap[cat];
    userProfile.occupation = cat;
  }
  if (cat === 'mahila') {
    const radio = document.querySelector('input[name="gender"][value="female"]');
    if (radio) radio.checked = true;
    userProfile.gender = 'female';
  }
  populateBirthYears();
}

// Theme
function initTheme() {
  const saved = localStorage.getItem('yojna_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('yojna_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  document.querySelectorAll('#themeBtn, #themeBtn2').forEach(btn => {
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
}

// Birth years
function populateBirthYears() {
  const sel = document.getElementById('profileAge');
  if (!sel) return;
  const current = sel.value;
  const currentYear = new Date().getFullYear();
  let html = `<option value="">${t('enter_yr_birth')}</option>`;
  for (let y = currentYear; y >= currentYear - 100; y--) {
    html += `<option value="${y}">${y}</option>`;
  }
  sel.innerHTML = html;
  if (current) sel.value = current;
}

// States
function populateStatesFilter() {
  const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
    'Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu','Delhi',
    'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
  ];
  const stateSel = document.getElementById('profileState');
  if (stateSel) {
    stateSel.innerHTML = `<option value="">${t('select_state')}</option>` +
      states.map(s => `<option value="${s}">${s}</option>`).join('');
  }
  const filterSel = document.getElementById('filterState');
  if (filterSel) {
    filterSel.innerHTML = `<option value="">Sabhi Rajya</option>` +
      states.map(s => `<option value="${s}">${s}</option>`).join('');
  }
}

// Language modal
function closeModal(e) {
  if (e.target === document.getElementById('langModal')) {
    document.getElementById('langModal').style.display = 'none';
  }
}

// Document upload
function handleFileUpload(input) {
  const files = Array.from(input.files);
  files.forEach(file => {
    const doc = { name: file.name, size: file.size, type: file.type, file, status: 'uploaded' };
    uploadedDocs.push(doc);
    uploadDocument(doc, uploadedDocs.length - 1);
  });
  renderUploadedFiles();
  input.value = '';
}

function renderUploadedFiles() {
  const container = document.getElementById('uploadedFiles');
  if (!container) return;
  container.innerHTML = uploadedDocs.map((doc, i) => `
    <div class="file-item">
      <span>📄</span>
      <span class="file-name">${doc.name}</span>
      <span class="file-status">${doc.status === 'processed' ? '✓' : doc.status === 'error' ? '✗' : '...'}</span>
      <span class="file-remove" onclick="removeFile(${i})">✕</span>
    </div>
  `).join('');
}

function removeFile(i) {
  uploadedDocs.splice(i, 1);
  renderUploadedFiles();
}

async function uploadDocument(doc, index) {
  try {
    const formData = new FormData();
    formData.append('document', doc.file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.demo) {
      uploadedDocs[index].status = 'processed';
      uploadedDocs[index].extracted = data.extractedFields;
    } else if (data.extractedFields) {
      uploadedDocs[index].status = 'processed';
      uploadedDocs[index].extracted = data.extractedFields;
      mergeDocumentData(data.extractedFields);
    } else {
      uploadedDocs[index].status = 'error';
    }
  } catch (err) {
    uploadedDocs[index].status = 'processed';
  }
  renderUploadedFiles();
}

function mergeDocumentData(fields) {
  if (fields.gender && !userProfile.gender) userProfile.gender = fields.gender;
  if (fields.income && !userProfile.income) userProfile.income = fields.income;
  if (fields.category && !userProfile.category) userProfile.category = fields.category;
}

// Voice input
let recognition = null;
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast(t('voice_not_supported'));
    showScreen('screen-profile');
    return;
  }

  showScreen('screen-profile');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = getSpeechLang(currentLang);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const voiceBanner = document.getElementById('voiceBanner');
  if (voiceBanner) {
    voiceBanner.style.display = 'flex';
    voiceBanner.classList.add('listening');
  }

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    processVoiceText(text);
    if (voiceBanner) voiceBanner.classList.remove('listening');
  };

  recognition.onerror = () => {
    if (voiceBanner) {
      voiceBanner.classList.remove('listening');
      voiceBanner.style.display = 'none';
    }
    showToast(t('voice_not_supported'));
  };

  recognition.onend = () => {
    if (voiceBanner) {
      voiceBanner.classList.remove('listening');
      voiceBanner.style.display = 'none';
    }
  };

  recognition.start();
}

function getSpeechLang(code) {
  const map = {
    'hi': 'hi-IN', 'en': 'en-IN', 'te': 'te-IN', 'mr': 'mr-IN',
    'ta': 'ta-IN', 'bn': 'bn-IN', 'gu': 'gu-IN', 'kn': 'kn-IN',
    'ml': 'ml-IN', 'pa': 'pa-IN', 'or': 'or-IN', 'as': 'as-IN',
    'ur': 'ur-IN'
  };
  return map[code] || 'hi-IN';
}

async function processVoiceText(text) {
  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const profile = await res.json();
    if (profile.age) {
      const sel = document.getElementById('profileAge');
      if (sel) sel.value = new Date().getFullYear() - profile.age;
    }
    if (profile.gender) {
      const radio = document.querySelector(`input[name="gender"][value="${profile.gender}"]`);
      if (radio) radio.checked = true;
    }
    if (profile.state) {
      const sel = document.getElementById('profileState');
      if (sel) sel.value = profile.state;
    }
    if (profile.occupation) {
      const sel = document.getElementById('profileOccupation');
      if (sel) sel.value = profile.occupation;
    }
    if (profile.income) {
      const sel = document.getElementById('profileIncome');
      if (sel) sel.value = profile.income;
    }
    if (profile.category) {
      const sel = document.getElementById('profileCategory');
      if (sel) sel.value = profile.category;
    }
    showToast(text);
  } catch (err) {
    showToast(t('kuch_dikkat'));
  }
}

// Submit profile
async function submitProfile() {
  const yearOfBirth = document.getElementById('profileAge').value;
  const gender = document.querySelector('input[name="gender"]:checked');
  const state = document.getElementById('profileState').value;
  const occupation = document.getElementById('profileOccupation').value;
  const income = document.getElementById('profileIncome').value;
  const category = document.getElementById('profileCategory').value;

  userProfile = {
    age: yearOfBirth ? new Date().getFullYear() - parseInt(yearOfBirth) : null,
    yearOfBirth: yearOfBirth || null,
    gender: gender ? gender.value : null,
    state: state || null,
    occupation: occupation || null,
    income: income || null,
    category: category || null
  };

  showScreen('screen-processing');
  document.querySelector('.processing-sub').textContent = t('processing_msg');

  try {
    const res = await fetch('/api/eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile)
    });
    const results = await res.json();
    renderResults(results);
    setTimeout(() => showScreen('screen-results'), 800);
  } catch (err) {
    showToast(t('kuch_dikkat'));
    showScreen('screen-home');
  }
}

// Render results
function renderResults(results) {
  const eligible = results.filter(r => r.eligible);
  const notEligible = results.filter(r => !r.eligible);
  const total = results.length;

  const summary = document.getElementById('resultsSummary');
  if (eligible.length > 0) {
    summary.className = 'results-summary eligible';
    summary.innerHTML = `${eligible.length} ${t('eligible_count')} | ${notEligible.length} ${t('not_eligible_count')} | ${total} ${t('total_schemes')}`;
  } else {
    summary.className = 'results-summary none';
    summary.innerHTML = `${t('no_schemes_found')} (${total} total)`;
  }

  const list = document.getElementById('resultsList');
  let html = '';

  if (eligible.length > 0) {
    html += `<h3 style="margin:16px 0 8px;font-size:16px;">${t('you_may_be_eligible')}</h3>`;
    eligible.forEach(r => { html += schemeCard(r, true); });
  }

  if (notEligible.length > 0) {
    html += `<h3 style="margin:24px 0 8px;font-size:16px;color:var(--text-secondary)">${t('not_eligible_count')}</h3>`;
    notEligible.forEach(r => { html += schemeCard(r, false); });
  }

  list.innerHTML = html;
}

function schemeCard(result, isEligible) {
  const s = result.scheme;
  const catIcons = {
    kisan: '🌾', vidyarthi: '📚', rojgar: '💼', mahila: '👩',
    swasthya: '🏥', ghar: '🏠', arthik_madad: '💰'
  };
  const icon = catIcons[s.category] || '📋';
  const badgeClass = result.matchLevel === 'likely_eligible' ? 'eligible' :
    result.matchLevel === 'possibly_eligible' ? 'check' : isEligible ? 'eligible' : 'not-eligible';
  const badgeText = isEligible ? t('eligible') : t('not_eligible');

  let docsHtml = '';
  if (s.requiredDocuments && s.requiredDocuments.length > 0) {
    docsHtml = `
      <div class="scheme-docs">
        <div class="scheme-docs-title">${t('required_documents')}:</div>
        <div class="scheme-docs-list">${s.requiredDocuments.join(', ')}</div>
      </div>`;
  }

  return `
    <div class="scheme-card ${isEligible ? 'eligible-card' : 'not-eligible-card'}">
      <div class="scheme-header">
        <div class="scheme-name">${icon} ${s.name}</div>
        <span class="scheme-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="scheme-benefit">${t('benefit')}: ${s.benefit}</div>
      <div class="scheme-desc">${s.shortDescription}</div>
      ${result.reasons.length > 0 ? `<div class="scheme-reason">${result.reasons.join('. ')}</div>` : ''}
      <div class="scheme-meta">
        <span>${t('source')}: <a href="${s.officialSourceUrl}" target="_blank" rel="noopener">${s.officialSourceUrl}</a></span>
        <span>${t('last_verified')}: ${s.lastVerified}</span>
      </div>
      ${docsHtml}
      <div class="scheme-actions">
        ${isEligible ? `<a href="${s.officialApplicationUrl}" target="_blank" rel="noopener" class="btn-apply">${t('aavedan_karein')} ↗</a>` : ''}
        <a href="${s.officialSourceUrl}" target="_blank" rel="noopener" class="btn-source">${t('view_source')} ↗</a>
      </div>
    </div>`;
}

// All schemes
async function loadAllSchemes() {
  try {
    const res = await fetch('/api/schemes');
    allSchemesData = await res.json();
    renderSchemesList(allSchemesData);
  } catch (err) {
    showToast(t('kuch_dikkat'));
  }
}

function filterSchemes() {
  const search = document.getElementById('schemeSearch').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const state = document.getElementById('filterState').value;

  let filtered = allSchemesData;
  if (search) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.shortDescription.toLowerCase().includes(search)
    );
  }
  if (category) filtered = filtered.filter(s => s.category === category);
  if (state) filtered = filtered.filter(s => s.state === 'all' || s.state === state);

  renderSchemesList(filtered);
}

function renderSchemesList(schemes) {
  const list = document.getElementById('schemesList');
  if (!list) return;

  if (schemes.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">${t('no_schemes_found')}</div>
      </div>`;
    return;
  }

  const catIcons = {
    kisan: '🌾', vidyarthi: '📚', rojgar: '💼', mahila: '👩',
    swasthya: '🏥', ghar: '🏠', arthik_madad: '💰'
  };
  const catNames = {
    kisan: t('kisan'), vidyarthi: t('vidyarthi'), rojgar: t('rojgar'),
    mahila: t('mahila'), swasthya: t('swasthya'), ghar: t('ghar'), arthik_madad: t('arthik_madad')
  };

  list.innerHTML = schemes.map(s => `
    <div class="scheme-list-item" onclick="showSchemeDetail('${s.id}')">
      <div class="scheme-list-icon">${catIcons[s.category] || '📋'}</div>
      <div class="scheme-list-info">
        <div class="scheme-list-name">${s.name}</div>
        <div class="scheme-list-cat">${catNames[s.category] || s.category} | ${s.shortDescription}</div>
      </div>
    </div>
  `).join('');
}

function showSchemeDetail(id) {
  const scheme = allSchemesData.find(s => s.id === id);
  if (!scheme) return;
  const list = document.getElementById('schemesList');
  const catIcons = {
    kisan: '🌾', vidyarthi: '📚', rojgar: '💼', mahila: '👩',
    swasthya: '🏥', ghar: '🏠', arthik_madad: '💰'
  };
  const icon = catIcons[scheme.category] || '📋';

  list.innerHTML = `
    <button onclick="filterSchemes()" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:14px;margin-bottom:12px;">⬅ Back to list</button>
    <div class="scheme-card eligible-card">
      <div class="scheme-header">
        <div class="scheme-name">${icon} ${scheme.name}</div>
      </div>
      <div class="scheme-benefit">${t('benefit')}: ${scheme.benefit}</div>
      <div class="scheme-desc">${scheme.shortDescription}</div>
      <div class="scheme-meta">
        <span>${t('source')}: <a href="${scheme.officialSourceUrl}" target="_blank" rel="noopener">${scheme.officialSourceUrl}</a></span>
        <span>${t('last_verified')}: ${scheme.lastVerified}</span>
      </div>
      ${scheme.requiredDocuments.length > 0 ? `
        <div class="scheme-docs">
          <div class="scheme-docs-title">${t('required_documents')}:</div>
          <div class="scheme-docs-list">${scheme.requiredDocuments.join(', ')}</div>
        </div>` : ''}
      <div class="scheme-actions">
        <a href="${scheme.officialApplicationUrl}" target="_blank" rel="noopener" class="btn-apply">${t('aavedan_karein')} ↗</a>
        <a href="${scheme.officialSourceUrl}" target="_blank" rel="noopener" class="btn-source">${t('view_source')} ↗</a>
      </div>
    </div>`;
}

// Toast
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Drag and drop
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--primary)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    const input = document.getElementById('fileInput');
    input.files = e.dataTransfer.files;
    handleFileUpload(input);
  });
});
