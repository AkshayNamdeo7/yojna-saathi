// Yojna Saathi - Part 3: direct AI voice conversation ("Bolkar poochhen")
// Voice / text entry -> natural language parsing -> only-necessary follow-ups -> existing eligibility flow.

let voiceSession = null;
let listenLoopActive = false;
let stopRequested = false;

const V_STATE_KEY = 'V_STATE';
const STALE_MS = 3 * 60 * 1000;
const FIELD_ORDER = ['occupation', 'age', 'income', 'gender', 'category', 'state'];
const MAX_TURNS = 32;

const FIELD_QUESTIONS = {
  hi: {
    occupation: 'आपका व्यवसाय क्या है?',
    age: 'आपकी उम्र कितनी है?',
    income: 'आपकी वार्षिक आय लगभग कितनी है?',
    gender: 'आप पुरुष हैं या महिला?',
    category: 'आपकी श्रेणी क्या है (General, OBC, SC, ST, EWS)?',
    state: 'आप किस राज्य में रहते हैं?'
  },
  en: {
    occupation: 'What is your occupation?',
    age: 'How old are you?',
    income: 'What is your approximate annual income?',
    gender: 'Are you male or female?',
    category: 'What is your category (General, OBC, SC, ST, EWS)?',
    state: 'Which state do you live in?'
  }
};

function voiceOwner() {
  return (isLoggedIn && userSession && userSession.mobileLast4) ? '•' + userSession.mobileLast4 : 'guest';
}

function voiceActive() {
  return !!(voiceSession && voiceSession.active);
}

function speechAvailable() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function hasValue(v) {
  return v !== null && v !== undefined && v !== '';
}

function mergeLocal(known, parsed) {
  const out = { ...(known || {}) };
  Object.keys(parsed || {}).forEach(k => {
    if (hasValue(parsed[k])) out[k] = parsed[k];
  });
  return out;
}

function computeMissingLocal(profile) {
  return FIELD_ORDER.filter(f => !hasValue(profile && profile[f]));
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fieldQuestion(field) {
  const lang = FIELD_QUESTIONS[currentLang] || FIELD_QUESTIONS.en;
  return lang[field] || lang.en[field] || field;
}

// ---------- State persistence (V_STATE) ----------

function readVState() {
  try {
    const raw = localStorage.getItem(V_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function saveVState() {
  if (!voiceSession || !voiceSession.active) {
    try { localStorage.removeItem(V_STATE_KEY); } catch (e) {}
    return;
  }
  const data = {
    owner: voiceOwner(),
    language: currentLang,
    active: true,
    messages: voiceSession.messages.slice(-60),
    extractedProfile: voiceSession.extractedProfile || {},
    intent: voiceSession.intent || null,
    missingFields: voiceSession.missingFields || [],
    utteranceCount: voiceSession.utteranceCount || 0,
    at: Date.now()
  };
  try { localStorage.setItem(V_STATE_KEY, JSON.stringify(data)); } catch (e) {}
}

function clearVState() {
  try { localStorage.removeItem(V_STATE_KEY); } catch (e) {}
}

// ---------- Session lifecycle ----------

function freshSeedProfile() {
  const p = readLocalProfile();
  if (!p) return null;
  if (p.updatedAt && Date.now() - p.updatedAt > STALE_MS) return null; // stale -> restart fresh
  if (p.owner && p.owner !== voiceOwner()) return null; // belongs to another user
  const seed = {};
  if (hasValue(p.age)) seed.age = p.age;
  if (hasValue(p.yearOfBirth)) seed.yearOfBirth = p.yearOfBirth;
  if (hasValue(p.gender)) seed.gender = p.gender;
  if (hasValue(p.state)) seed.state = p.state;
  if (hasValue(p.occupation)) seed.occupation = p.occupation;
  if (hasValue(p.income)) seed.income = p.income;
  if (hasValue(p.category)) seed.category = p.category;
  return Object.keys(seed).length ? seed : null;
}

function seedSummary(p) {
  const names = { kisan: t('kisan'), student: t('vidyarthi'), naukri: t('rojgar'), vyavasaya: t('business'), mazdoor: 'Mazdoor', retired: 'Retired', other: 'Other' };
  const parts = [];
  if (hasValue(p.occupation)) parts.push(names[p.occupation] || p.occupation);
  if (hasValue(p.age)) parts.push(p.age + ' ' + t('years'));
  if (hasValue(p.gender)) parts.push(t(p.gender));
  if (hasValue(p.state)) parts.push(p.state);
  if (hasValue(p.income)) parts.push('₹' + p.income);
  if (hasValue(p.category)) parts.push(p.category.toUpperCase());
  return parts.join(', ');
}

function newSession() {
  const seed = freshSeedProfile();
  voiceSession = {
    active: true,
    language: currentLang,
    messages: [],
    extractedProfile: seed || {},
    intent: null,
    missingFields: seed ? computeMissingLocal(seed) : FIELD_ORDER.slice(),
    utteranceCount: 0,
    sentDirectText: false,
    startedAt: Date.now()
  };
  if (seed && Object.keys(seed).length) {
    pushMsg('bot', t('understood') + ' ' + (t('need_more_information') + ' ' + fieldQuestion(voiceSession.missingFields[0])));
  } else {
    pushMsg('bot', t('need_more_information') + ' ' + fieldQuestion(voiceSession.missingFields[0]));
  }
}

function initOrResumeVoice() {
  const saved = readVState();
  if (saved && saved.owner === voiceOwner() && saved.active) {
    voiceSession = {
      active: true,
      language: saved.language || currentLang,
      messages: Array.isArray(saved.messages) ? saved.messages : [],
      extractedProfile: saved.extractedProfile || {},
      intent: saved.intent || null,
      missingFields: saved.missingFields || computeMissingLocal(saved.extractedProfile),
      utteranceCount: saved.utteranceCount || 0,
      sentDirectText: false,
      startedAt: Date.now()
    };
  } else {
    newSession();
  }
  renderTranscript();
  updateVoiceHeaderButton(true);
}

function endVoiceSession() {
  stopRequested = true;
  if (recognition) { try { recognition.onend = null; recognition.stop(); } catch (e) {} recognition = null; }
  listenLoopActive = false;
  if (voiceSession) voiceSession.active = false;
  clearVState();
  closeVoiceModal();
  updateVoiceHeaderButton(false);
}

// ---------- UI helpers ----------

function renderTranscript() {
  const box = document.getElementById('voiceTranscript');
  if (!box) return;
  box.innerHTML = (voiceSession ? voiceSession.messages : []).map(m =>
    `<div class="voice-msg ${m.who === 'user' ? 'user' : 'bot'}"><div class="voice-msg-text">${escapeHtml(m.text)}</div></div>`
  ).join('');
  box.scrollTop = box.scrollHeight;
}

function pushMsg(who, text) {
  if (!voiceSession) return;
  voiceSession.messages.push({ who, text, at: Date.now() });
  if (voiceSession.messages.length > 80) voiceSession.messages = voiceSession.messages.slice(-80);
  setTyping(false);
  renderTranscript();
  saveVState();
}

function setTyping(on) {
  const box = document.getElementById('voiceTranscript');
  if (!box) return;
  let el = document.getElementById('voiceTyping');
  if (!on) {
    if (el) el.remove();
    box.scrollTop = box.scrollHeight;
    return;
  }
  if (!el) {
    el = document.createElement('div');
    el.id = 'voiceTyping';
    el.className = 'voice-msg bot voice-typing';
    el.innerHTML = '<div class="voice-msg-text">' + t('voice_thinking') + '</div>';
    box.appendChild(el);
  }
  box.scrollTop = box.scrollHeight;
}

function setStatus(text, state) {
  const wrap = document.getElementById('voiceStatus');
  const dot = document.getElementById('voiceStatusDot');
  const txt = document.getElementById('voiceStatusText');
  if (!wrap) return;
  if (text) {
    wrap.style.display = '';
    if (txt) txt.textContent = text;
    wrap.className = 'voice-status' + (state ? ' ' + state : '');
    if (dot) dot.style.display = (state === 'idle' || state === 'done') ? 'none' : '';
  } else {
    wrap.style.display = 'none';
  }
}

// ---------- Modal ----------

function openVoice() {
  initOrResumeVoice();
  const modal = document.getElementById('voiceModal');
  if (!modal) return;
  stopRequested = false;
  modal.style.display = 'flex';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', t('voice_title'));
  document.body.style.overflow = 'hidden';
  const input = document.getElementById('voiceTextInput');
  if (input) input.value = '';
  startListenLoop();
}

function closeVoiceModal() {
  const modal = document.getElementById('voiceModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  stopRequested = true;
  if (recognition) { try { recognition.stop(); } catch (e) {} }
  if (voiceSession && voiceSession.active) setStatus('', '');
  saveVState();
}

function closeVoiceModalBackdrop(e) {
  if (e.target === document.getElementById('voiceModal')) closeVoiceModal();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('voiceModal');
    if (modal && modal.style.display === 'flex') closeVoiceModal();
  }
});

function cancelVoice() {
  const wasActive = voiceActive();
  endVoiceSession();
  if (wasActive) showToast(t('cancel'));
}

// ---------- SpeechRecognition ----------

function stopVoiceListening() {
  stopRequested = true;
  if (recognition) { try { recognition.stop(); } catch (e) {} }
  listenLoopActive = false;
}

function listenOnce() {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = getSpeechLang(voiceSession ? voiceSession.language : currentLang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let settled = false;
    recognition.onresult = (ev) => {
      if (settled) return; settled = true;
      const text = (ev.results[0][0].transcript || '').trim();
      resolve({ text });
    };
    recognition.onerror = (ev) => {
      if (settled) return; settled = true;
      reject(new Error(ev.error || 'error'));
    };
    recognition.onend = () => {
      if (settled) return; settled = true;
      resolve({ text: '' });
    };
    try { recognition.start(); } catch (e) { reject(new Error('start_error')); }
  });
}

async function startListenLoop() {
  if (!voiceSession || !voiceSession.active) return;
  if (listenLoopActive && !stopRequested) return;
  if (!speechAvailable()) {
    setStatus(t('voice_unavailable') + ' ' + t('type_instead'), 'error');
    updateVoiceMicButton(false);
    return;
  }
  listenLoopActive = true;
  stopRequested = false;
  updateVoiceMicButton(true);
  while (voiceSession && voiceSession.active && !stopRequested) {
    setStatus(t('listening'), 'listening');
    try {
      const { text } = await listenOnce();
      if (!text) continue;
      await handleUtterance(text, false);
      if (!voiceSession || !voiceSession.active) break;
    } catch (err) {
      const code = err.message;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setStatus(t('microphone_denied'), 'error');
      } else if (code === 'unavailable') {
        setStatus(t('voice_unavailable') + ' ' + t('type_instead'), 'error');
      } else {
        setStatus(t('voice_error'), 'error');
      }
      break;
    }
  }
  listenLoopActive = false;
  updateVoiceMicButton(false);
  if (voiceSession && voiceSession.active && !stopRequested) {
    setStatus(t('speaking'), 'idle');
  } else {
    setStatus('', '');
  }
}

function updateVoiceMicButton(listening) {
  const btn = document.getElementById('voiceMicToggle');
  if (!btn) return;
  btn.textContent = listening ? t('stop_listening') : t('speaking');
  btn.classList.toggle('btn-primary', !listening);
  btn.classList.toggle('btn-ghost', listening);
}

function toggleVoiceListening() {
  if (listenLoopActive && !stopRequested) {
    stopRequested = true;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    setStatus(t('speaking'), 'idle');
    updateVoiceMicButton(false);
  } else {
    startListenLoop();
  }
}

// ---------- Conversation ----------

async function handleUtterance(rawText, isDirect) {
  if (!voiceSession || !voiceSession.active) return;
  const text = String(rawText || '').trim();
  if (!text) return;

  voiceSession.sentDirectText = isDirect;
  voiceSession.language = currentLang;
  const prevMissing = voiceSession.missingFields.slice();

  pushMsg('user', (isDirect ? '💬 ' : '🎤 ') + text);
  setTyping(true);

  try {
    const res = await fetch('/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: currentLang, known: voiceSession.extractedProfile || {} })
    });
    if (!res.ok) throw new Error('voice_intent_failed');
    const data = await res.json();

    voiceSession.extractedProfile = mergeLocal(voiceSession.extractedProfile, data.newlyParsed || {});
    if (hasValue(data.profile)) voiceSession.extractedProfile = mergeLocal(voiceSession.extractedProfile, data.profile);
    voiceSession.intent = data.intent || 'chat';
    voiceSession.missingFields = computeMissingLocal(voiceSession.extractedProfile);
    voiceSession.utteranceCount += 1;

    const newlyParsed = Object.keys(data.newlyParsed || {}).filter(k => hasValue(data.newlyParsed[k]));
    const filledNow = newlyParsed.filter(k => prevMissing.indexOf(k) !== -1 && k !== 'state');

    setTyping(false);

    const decision = decideNext(data, filledNow.length > 0, isDirect);
    if (decision.action === 'search') {
      finalizeAndSearch();
      return;
    }

    if (voiceSession.utteranceCount >= 2 && !isDirect) {
      pushMsg('bot', t('voice_thinking'));
      await sleep(450);
    }
    pushMsg('bot', decision.message);
    setStatus(t('speaking'), 'idle');
  } catch (err) {
    setTyping(false);
    pushMsg('bot', t('voice_error'));
    setStatus(t('speaking'), 'idle');
  }
}

function decideNext(data, filledCoreNow, isDirect) {
  const wants = !!data.wantsResults;
  const ready = !!data.ready;
  const missing = voiceSession.missingFields;
  const newlyParsed = Object.keys(data.newlyParsed || {}).filter(k => hasValue(data.newlyParsed[k]));

  if (wants && ready) return { action: 'search' };
  if (missing.length === 0) return { action: 'search' };
  if (!isDirect && voiceSession.utteranceCount >= 2 && filledCoreNow) return { action: 'search' };
  if (voiceSession.utteranceCount >= MAX_TURNS) return { action: 'search' };

  const next = missing[0];
  const message = newlyParsed.length
    ? t('understood') + ' ' + fieldQuestion(next)
    : t('try_again') + ' ' + fieldQuestion(next);
  return { action: 'ask', message };
}

function finalizeAndSearch() {
  if (!voiceSession) return;
  pushMsg('bot', t('information_collected') + ' ✓');
  setStatus('', 'done');
  const profile = { ...(voiceSession.extractedProfile || {}) };
  endVoiceSession();
  fillAndSearch(profile);
}

async function sendVoiceText() {
  const input = document.getElementById('voiceTextInput');
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text || !voiceSession || !voiceSession.active) return;
  input.value = '';
  stopVoiceListening();
  setStatus('', '');
  await handleUtterance(text, true);
  if (voiceSession && voiceSession.active) {
    stopRequested = false;
    startListenLoop();
  }
}

// ---------- Transition to existing eligibility flow ----------

async function fillAndSearch(profileOverride) {
  const p = profileOverride || (voiceSession ? voiceSession.extractedProfile : {}) || {};

  userProfile = {
    age: hasValue(p.age) ? p.age : null,
    yearOfBirth: hasValue(p.yearOfBirth) ? p.yearOfBirth : (hasValue(p.age) ? new Date().getFullYear() - parseInt(p.age, 10) : null),
    gender: hasValue(p.gender) ? p.gender : null,
    state: hasValue(p.state) ? p.state : null,
    occupation: hasValue(p.occupation) ? p.occupation : null,
    income: hasValue(p.income) ? p.income : null,
    category: hasValue(p.category) ? p.category : null
  };
  attachDocEvidence(userProfile);
  saveLocalProfile(userProfile);

  showScreen('screen-processing');
  const sub = document.querySelector('.processing-sub');
  if (sub) sub.textContent = t('searching_for_schemes');

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