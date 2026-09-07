let userProfile = {};
let allSchemesData = [];
let requestedSchemeId = null;

let isLoggedIn = false;
let userSession = null;
const DEMO_OTP = '123456';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildLanguageGrids();
  populateBirthYears();
  populateStatesFilter();
  applyTranslations();
  initLoginState();
  refreshGuestChip();
  loadServerTranslations(currentLang).then(() => {
    applyTranslations();
    updateOccupationOptions();
    buildLanguageGrids();
    renderLoginState();
  });
});

function openLangModal() {
  const modal = document.getElementById('langModal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t('apni_bhasha'));
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-header .icon-btn');
  if (closeBtn) closeBtn.focus();
}

function closeLangModal() {
  const modal = document.getElementById('langModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function modalIsOpen(id) {
  const el = document.getElementById(id);
  return el && el.style.display === 'flex';
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modalIsOpen('loginModal')) closeLoginModal();
  else if (modalIsOpen('profileModal')) closeProfileModal();
  else closeLangModal();
});

// ---------- Login / session state ----------

function initLoginState() {
  isLoggedIn = false;
  userSession = null;
  try {
    const raw = localStorage.getItem('yojna_user');
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.mobileLast4) {
        isLoggedIn = true;
        userSession = { login: 'demo-otp', mobileLast4: data.mobileLast4 };
      }
    }
  } catch (e) {
    isLoggedIn = false;
    userSession = null;
  }
  renderLoginState();
}

function renderLoginState() {
  const buttons = document.querySelectorAll('[data-login]');
  buttons.forEach(btn => {
    if (isLoggedIn) {
      btn.textContent = '👤 ' + (userSession ? '•' + userSession.mobileLast4 : '');
      btn.classList.add('logged-in');
      btn.setAttribute('aria-label', t('profile'));
      btn.title = t('profile');
      btn.onclick = () => openProfileModal();
    } else {
      btn.textContent = t('login');
      btn.classList.remove('logged-in');
      btn.setAttribute('aria-label', t('login'));
      btn.title = t('login');
      btn.onclick = () => openLoginModal();
    }
  });
}

function refreshGuestChip() {
  const chip = document.getElementById('guestChip');
  if (!chip) return;
  chip.style.display = isLoggedIn ? 'none' : 'inline-block';
}

function updateVoiceHeaderButton(show) {
  const btn = document.getElementById('voiceQuickBtn');
  if (!btn) return;
  const visible = show !== undefined
    ? !!show
    : (typeof window.voiceActive === 'function' && window.voiceActive());
  btn.style.display = visible ? 'flex' : 'none';
  if (visible) {
    btn.setAttribute('aria-label', t('voice_title'));
    btn.title = t('voice_title');
  }
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  showModalStep('loginStep1');
  clearLoginInputs();
  modal.style.display = 'flex';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t('optional_login'));
  document.body.style.overflow = 'hidden';
  const mobile = document.getElementById('loginMobile');
  if (mobile) mobile.focus();
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  clearLoginInputs();
}

function closeLoginModalBackdrop(e) {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
}

function showModalStep(stepId) {
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep2').style.display = 'none';
  document.getElementById(stepId).style.display = 'block';
}

function clearLoginInputs() {
  const mobile = document.getElementById('loginMobile');
  const otp = document.getElementById('loginOtp');
  if (mobile) mobile.value = '';
  if (otp) otp.value = '';
  showModalStep('loginStep1');
}

function submitMobile() {
  const mobile = document.getElementById('loginMobile');
  const value = (mobile.value || '').replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(value)) {
    showToast(t('invalid_mobile'));
    mobile.focus();
    return;
  }
  showModalStep('loginStep2');
  const otp = document.getElementById('loginOtp');
  if (otp) otp.focus();
}

function verifyOtp() {
  const otp = document.getElementById('loginOtp');
  const otpValue = (otp.value || '').replace(/\D/g, '');
  if (otpValue !== DEMO_OTP) {
    showToast(t('invalid_otp'));
    otp.focus();
    return;
  }
  const mobile = document.getElementById('loginMobile');
  const mobileLast4 = (mobile.value || '').slice(-4);
  isLoggedIn = true;
  userSession = { login: 'demo-otp', mobileLast4 };
  try {
    localStorage.setItem('yojna_user', JSON.stringify({ login: 'demo-otp', mobileLast4, at: Date.now() }));
    const profile = readLocalProfile();
    if (profile) {
      localStorage.setItem('yojna_profile', JSON.stringify({ ...profile, owner: mobileLast4 }));
    }
  } catch (e) {}
  showToast(t('login_success'));
  closeLoginModal();
  renderLoginState();
  refreshGuestChip();
}

function backToMobileStep() {
  showModalStep('loginStep1');
  const mobile = document.getElementById('loginMobile');
  if (mobile) mobile.focus();
}

function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  const mobileText = document.getElementById('profileMobileText');
  if (mobileText) mobileText.textContent = userSession ? '+91 •••••• ' + userSession.mobileLast4 : '—';

  const profile = readLocalProfile();
  const guestBlock = document.getElementById('profileGuestBlock');
  const guestText = document.getElementById('profileGuestText');
  if (profile && profile.yearOfBirth) {
    if (guestBlock) guestBlock.style.display = '';
    if (guestText) guestText.textContent = formatProfileSummary(profile);
  } else if (guestBlock) {
    guestBlock.style.display = 'none';
  }

  const searchText = document.getElementById('profileSearchText');
  const lastSearch = readLocalSearch();
  if (lastSearch && lastSearch.at) {
    const date = new Date(lastSearch.at).toLocaleDateString(currentLang === 'en' ? 'en-IN' : currentLang, { day: 'numeric', month: 'short' });
    searchText.textContent = `${date} — ${lastSearch.total} ${t('schemes_found')}`;
  }

  modal.style.display = 'flex';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t('profile'));
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function closeProfileModalBackdrop(e) {
  if (e.target === document.getElementById('profileModal')) closeProfileModal();
}

function logout() {
  isLoggedIn = false;
  userSession = null;
  try {
    localStorage.removeItem('yojna_user');
  } catch (e) {}
  closeProfileModal();
  renderLoginState();
  refreshGuestChip();
  showToast(t('logged_out'));
}

// ---------- Temporary local profile (guest session) ----------

function readLocalProfile() {
  try {
    const raw = localStorage.getItem('yojna_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function readLocalSearch() {
  try {
    const raw = localStorage.getItem('yojna_last_search');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function saveLocalProfile(profile) {
  try {
    localStorage.setItem('yojna_profile', JSON.stringify({ ...profile, updatedAt: Date.now(), owner: isLoggedIn && userSession ? userSession.mobileLast4 : null }));
  } catch (e) {}
}

function saveLocalSearch(profile, total) {
  try {
    localStorage.setItem('yojna_last_search', JSON.stringify({ profile, total, at: Date.now() }));
  } catch (e) {}
}

function formatProfileSummary(profile) {
  const parts = [];
  if (profile.yearOfBirth) parts.push(`${profile.yearOfBirth} (${new Date().getFullYear() - parseInt(profile.yearOfBirth, 10)} ${t('years')})`);
  if (profile.gender) parts.push(t(profile.gender));
  if (profile.state) parts.push(profile.state);
  if (profile.occupation) {
    const m = {
      kisan: t('kisan'), student: t('vidyarthi'), naukri: t('rojgar'),
      vyavasaya: t('business'), mazdoor: 'Mazdoor', retired: 'Retired', other: 'Other'
    };
    parts.push(m[profile.occupation] || profile.occupation);
  }
  if (profile.income) parts.push('₹' + profile.income);
  if (profile.category) parts.push(profile.category.toUpperCase());
  return parts.length ? parts.join(', ') : t('no_saved_search');
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
  document.querySelectorAll('[id^="themeBtn"]').forEach(btn => {
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
    closeLangModal();
  }
}

// Document upload (moved to documents.js)

// Attach non-sensitive document evidence to the profile for this session.
// Sensitive fields (aadhaar, address, dob) are used in-session but never persisted.
function attachDocEvidence(profile) {
  if (typeof docUploadedDocs === 'undefined' || !Array.isArray(docUploadedDocs)) return profile;
  if (docUploadedDocs.length === 0) return profile;
  const list = docUploadedDocs.map(d => {
    const evidence = {};
    Object.keys(d.extracted || {}).forEach(k => {
      if (k === 'aadhaar' || k === 'address' || k === 'dob' || k === 'district') return;
      if (d.extracted[k] !== null && d.extracted[k] !== undefined && d.extracted[k] !== '') evidence[k] = d.extracted[k];
    });
    return { type: d.type, status: d.status, demo: !!d.demo, fields: evidence };
  });
  profile.documents = list;
  return profile;
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
    if (!res.ok) throw new Error('voice_failed');
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
  if (requestedSchemeId) userProfile.requestedId = requestedSchemeId;
  attachDocEvidence(userProfile);
  saveLocalProfile(userProfile);

  showScreen('screen-processing');
  document.querySelector('.processing-sub').textContent = t('processing_msg');

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch('/api/eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error('eligibility_failed');
    const data = await res.json();
    const results = Array.isArray(data) ? data : data.results;
    saveLocalSearch(userProfile, results.length);
    renderResults(data);
    setTimeout(() => showScreen('screen-results'), 800);
  } catch (err) {
    showToast(t('kuch_dikkat'));
    showScreen('screen-home');
  }
}

// Render results (three states: eligible / more_info_needed / not_eligible) + alternatives
function renderResults(data) {
  const arr = Array.isArray(data) ? data : (data && data.results) || [];
  const meta = (Array.isArray(data) ? null : data) || null;
  const eligible = arr.filter(r => r.status === 'eligible');
  const moreInfo = arr.filter(r => r.status === 'more_info_needed');
  const notEligible = arr.filter(r => r.status === 'not_eligible');
  const total = arr.length;

  const summary = document.getElementById('resultsSummary');
  if (eligible.length > 0 || moreInfo.length > 0) {
    summary.className = 'results-summary eligible';
    const parts = [`${eligible.length} ${t('eligible_count')}`, `${moreInfo.length} ${t('more_info_needed')}`, `${notEligible.length} ${t('not_eligible_count')}`, `${total} ${t('total_schemes')}`];
    summary.innerHTML = parts.join(' | ');
  } else {
    summary.className = 'results-summary none';
    summary.innerHTML = `${t('no_schemes_found')} (${total} total)`;
  }

  const list = document.getElementById('resultsList');
  let html = '';

  // Requested scheme + alternatives (eligible FIRST, alternatives prominent)
  if (meta && meta.requested) {
    html += `<h3 class="results-section-title focus">🔍 ${meta.requested.scheme.name}</h3>`;
    html += schemeCard(meta.requested, true);
    if (meta.requested.status !== 'eligible' && meta.alternatives && meta.alternatives.length > 0) {
      html += `<div class="alternatives-panel">`;
      html += `<h3 class="results-section-title alt-title">${t('alternatives')}</h3>`;
      meta.alternatives.forEach(a => { html += alternativeCard(a); });
      html += `</div>`;
    } else if (meta.requested.status !== 'eligible') {
      html += noDeadEndHint();
    }
    list.innerHTML = html;
    return;
  }

  if (eligible.length > 0) {
    html += `<h3 class="results-section-title">${t('you_may_be_eligible')}</h3>`;
    eligible.forEach(r => { html += schemeCard(r, true); });
  }

  if (moreInfo.length > 0) {
    html += `<h3 class="results-section-title">${t('more_info_needed')}</h3>`;
    moreInfo.forEach(r => { html += schemeCard(r, false); });
  }

  if (notEligible.length > 0) {
    html += `<h3 class="results-section-title">${t('not_eligible_count')}</h3>`;
    notEligible.forEach(r => { html += schemeCard(r, false); });
  }

  if (eligible.length === 0 && moreInfo.length === 0 && notEligible.length === 0) {
    html += noDeadEndHint();
  } else if (eligible.length === 0 && moreInfo.length === 0) {
    html += `<div class="hint-box">${t('all_eligible_empty')}</div>`;
  }

  list.innerHTML = html;
}

// No dead-end: always give the user a next step
function noDeadEndHint() {
  return `
    <div class="hint-box" role="note">
      ${t('no_eligible_hint')}
      <button class="btn btn-ghost btn-full hint-btn" onclick="showScreen('screen-profile'); submitProfile();">${t('check_this_scheme')}</button>
    </div>`;
}

function schemeCard(result, highlight) {
  const s = result.scheme;
  const status = result.status || (result.eligible ? 'eligible' : 'not_eligible');
  const catIcons = {
    kisan: '🌾', vidyarthi: '📚', rojgar: '💼', mahila: '👩',
    swasthya: '🏥', ghar: '🏠', arthik_madad: '💰'
  };
  const icon = catIcons[s.category] || '📋';

  let badgeClass = 'not-eligible';
  let badgeText = t('not_eligible');
  if (status === 'eligible') { badgeClass = 'eligible'; badgeText = t('eligible'); }
  else if (status === 'more_info_needed') { badgeClass = 'check'; badgeText = t('more_info_needed'); }

  const cardClass = status === 'eligible' ? 'scheme-card eligible-card'
    : status === 'more_info_needed' ? 'scheme-card more-info-card'
    : 'scheme-card not-eligible-card';

  let docsHtml = '';
  if (s.requiredDocuments && s.requiredDocuments.length > 0) {
    docsHtml = `
      <div class="scheme-docs">
        <div class="scheme-docs-title">${t('required_documents')}:</div>
        <div class="scheme-docs-list">${s.requiredDocuments.join(', ')}</div>
      </div>`;
  }

  const reasons = (result.reasons && result.reasons.length) ? result.reasons.join('. ') : '';
  let extraHtml = '';
  if (status === 'more_info_needed') {
    const miss = result.missingFields || [];
    const reqDocMiss = result.requiredEvidenceMissing || [];
    if (miss.length || reqDocMiss.length) {
      extraHtml += `<div class="scheme-reason info">${t('missing_info')} ${miss.map(m => fieldLabel(m.field)).join(', ')}${reqDocMiss.length ? (miss.length ? ', ' : '') + reqDocMiss.join(', ') : ''}</div>`;
    }
    if (result.conflicts && result.conflicts.length) {
      extraHtml += `<div class="scheme-reason conflict">${t('verify_conflict')}</div>`;
    }
  } else if (status === 'not_eligible' && reasons) {
    extraHtml += `<div class="scheme-reason">${reasons}</div>`;
  }

  const evidenceHtml = (result.evidenceUsed && result.evidenceUsed.length > 0)
    ? `<div class="scheme-evidence">${t('evidence_used')}: ${result.evidenceUsed.map(e => fieldLabel(e.field) + ' (' + sourceLabel(e.source) + ')').join(', ')}</div>`
    : '';

  const eligibilityHtml = s.eligibilityRules && s.eligibilityRules.conditions && s.eligibilityRules.conditions.length
    ? `<div class="scheme-eligibility"><span>${t('eligibility_summary')}:</span> ${s.eligibilityRules.conditions.join('; ')}</div>`
    : '';

  const govLabel = `<span class="gov-source">🛡️ ${t('official_gov_source')} · ${t('last_verified')}: ${s.lastVerified}</span>`;

  return `
    <div class="${cardClass}">
      <div class="scheme-header">
        <div class="scheme-name">${icon} ${s.name}</div>
        <span class="scheme-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="scheme-benefit">${t('benefit')}: ${s.benefit}</div>
      <div class="scheme-desc">${s.shortDescription}</div>
      ${eligibilityHtml}
      ${extraHtml}
      ${evidenceHtml}
      <div class="scheme-meta">
        ${govLabel}
        <span>${t('source')}: <a href="${s.officialSourceUrl}" target="_blank" rel="noopener" onclick="return handleOfficialLink(event, '${s.officialSourceUrl}', '${s.officialApplicationUrl}')">${s.officialSourceUrl}</a></span>
      </div>
      ${docsHtml}
      <div class="scheme-actions">
        ${status === 'eligible' ? `<a href="${s.officialApplicationUrl}" target="_blank" rel="noopener" class="btn-apply" onclick="return handleOfficialLink(event, '${s.officialApplicationUrl}', '${s.officialSourceUrl}')">${t('aavedan_karein')} ↗</a>` : ''}
        <a href="${s.officialSourceUrl}" target="_blank" rel="noopener" class="btn-source" onclick="return handleOfficialLink(event, '${s.officialSourceUrl}', '${s.officialApplicationUrl}')">${t('view_source')} ↗</a>
      </div>
    </div>`;
}

function alternativeCard(a) {
  const govLabel = a.officialSourceUrl ? `<span class="gov-source">🛡️ ${t('official_gov_source')} · ${t('last_verified')}: ${a.lastVerified || '—'}</span>` : '';
  return `
    <div class="scheme-card eligible-card alt-card">
      <div class="scheme-header">
        <div class="scheme-name">${a.name}</div>
        <span class="scheme-badge eligible">${t('eligible')}</span>
      </div>
      <div class="scheme-benefit">${t('benefit')}: ${a.benefit}</div>
      ${a.eligibilityRules && a.eligibilityRules.conditions && a.eligibilityRules.conditions.length ? `<div class="scheme-eligibility"><span>${t('eligibility_summary')}:</span> ${a.eligibilityRules.conditions.join('; ')}</div>` : ''}
      ${a.evidenceUsed && a.evidenceUsed.length ? `<div class="scheme-evidence">${t('evidence_used')}: ${a.evidenceUsed.map(e => fieldLabel(e.field) + ' (' + sourceLabel(e.source) + ')').join(', ')}</div>` : ''}
      ${govLabel ? `<div class="scheme-meta">${govLabel}</div>` : ''}
      <div class="scheme-actions">
        <a href="${a.officialApplicationUrl}" target="_blank" rel="noopener" class="btn-apply" onclick="return handleOfficialLink(event, '${a.officialApplicationUrl}', '${a.officialSourceUrl || a.officialApplicationUrl}')">${t('aavedan_karein')} ↗</a>
      </div>
    </div>`;
}

// Graceful handling of official external links: probe availability asynchronously,
// show a friendly toast if the official site appears unavailable, and offer the fallback source link.
function handleOfficialLink(event, url, fallbackUrl) {
  if (!url) return true;
  const link = event && event.currentTarget;
  fetch(url, { method: 'HEAD', mode: 'no-cors' })
    .then(() => {})
    .catch(() => {
      showToast(t('link_failed'));
      if (fallbackUrl && fallbackUrl !== url && link) {
        link.setAttribute('href', fallbackUrl);
        link.textContent = (link.textContent || '').replace('↗', '') + ' ↗';
      }
    });
  return true;
}

function fieldLabel(f) {
  const labels = { age: t('age'), gender: t('gender'), occupation: t('occupation'), income: t('income'), category: t('category'), state: t('state') };
  return labels[f] || f;
}

function sourceLabel(s) {
  const labels = { user: 'Form/Voice', document: t('documents'), conflict: 'Verification needed' };
  return labels[s] || s;
}

// All schemes
async function loadAllSchemes() {
  const list = document.getElementById('schemesList');
  if (list) {
    list.innerHTML = `
      <div class="loading-state" role="status" aria-live="polite">
        <div class="spinner"></div>
        <div>${t('processing_msg')}</div>
      </div>`;
  }
  try {
    const res = await fetch('/api/schemes');
    if (!res.ok) throw new Error('schemes_fetch_failed');
    allSchemesData = await res.json();
    if (!Array.isArray(allSchemesData)) throw new Error('schemes_invalid');
    renderSchemesList(allSchemesData);
  } catch (err) {
    if (list) {
      list.innerHTML = `
        <div class="empty-state" role="alert">
          <div class="empty-icon">⚠️</div>
          <div class="empty-text">${t('kuch_dikkat')}</div>
        </div>`;
    } else {
      showToast(t('kuch_dikkat'));
    }
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
      ${scheme.eligibilityRules && scheme.eligibilityRules.conditions && scheme.eligibilityRules.conditions.length ? `<div class="scheme-eligibility"><span>${t('eligibility_summary')}:</span> ${scheme.eligibilityRules.conditions.join('; ')}</div>` : ''}
      <div class="scheme-meta">
        <span class="gov-source">🛡️ ${t('official_gov_source')} · ${t('last_verified')}: ${scheme.lastVerified}</span>
        <span>${t('source')}: <a href="${scheme.officialSourceUrl}" target="_blank" rel="noopener" onclick="return handleOfficialLink(event, '${scheme.officialSourceUrl}', '${scheme.officialApplicationUrl}')">${scheme.officialSourceUrl}</a></span>
      </div>
      ${scheme.requiredDocuments.length > 0 ? `
        <div class="scheme-docs">
          <div class="scheme-docs-title">${t('required_documents')}:</div>
          <div class="scheme-docs-list">${scheme.requiredDocuments.join(', ')}</div>
        </div>` : ''}
      <div class="scheme-actions">
        <a href="${scheme.officialApplicationUrl}" target="_blank" rel="noopener" class="btn-apply" onclick="return handleOfficialLink(event, '${scheme.officialApplicationUrl}', '${scheme.officialSourceUrl}')">${t('aavedan_karein')} ↗</a>
        <a href="${scheme.officialSourceUrl}" target="_blank" rel="noopener" class="btn-source" onclick="return handleOfficialLink(event, '${scheme.officialSourceUrl}', '${scheme.officialApplicationUrl}')">${t('view_source')} ↗</a>
        <button onclick="checkThisScheme('${scheme.id}')" class="btn-apply" style="margin-top:8px;width:100%;">${t('check_this_scheme')}</button>
      </div>
    </div>`;
}

function checkThisScheme(id) {
  requestedSchemeId = id;
  showScreen('screen-home');
  setTimeout(() => submitProfile(), 50);
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
