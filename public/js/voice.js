// Yojna Saathi - Part 3: direct AI voice conversation ("Bolkar poochhen")
// Voice / text entry -> natural language parsing -> only-necessary follow-ups -> existing eligibility flow.

let voiceSession = null;
let micBusy = false;
let micEligible = false;
let stopRequested = false;
let reListenTimer = null;

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

// Gentle "here is an example" hint shown only after one failed attempt. Never a loop.
const FIELD_HINTS = {
  hi: {
    occupation: 'जैसे "खेती करता हूँ" या "नौकरी करता हूँ" बोलें।',
    age: 'जैसे "मेरी उम्र 45 साल है" या सिर्फ "45" बोलें।',
    income: 'जैसे "सालाना 2 लाख" या "15 हजार महीना" या सिर्फ "12000" बोलें।',
    gender: 'जैसे "मैं पुरुष हूँ" या "महिला हूँ" बोलें।',
    category: 'जैसे "मैं OBC हूँ" या "पिछड़ा वर्ग" बोलें।',
    state: 'जैसे "मध्य प्रदेश" या "उत्तर प्रदेश" बोलें।'
  },
  en: {
    occupation: 'For example say "I farm" or "I have a job".',
    age: 'For example say "I am 45" or just "45".',
    income: 'For example say "2 lakh a year" or "15 thousand a month" or just "12000".',
    gender: 'For example say "I am male" or "I am female".',
    category: 'For example say "I am OBC" or "backward class".',
    state: 'For example say "Madhya Pradesh" or "Uttar Pradesh".'
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
    noParseStreak: voiceSession.noParseStreak || 0,
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
    noParseStreak: 0,
    sentDirectText: false,
    startedAt: Date.now()
  };
  if (seed && Object.keys(seed).length) {
    if (voiceSession.missingFields.length) {
      pushMsg('bot', t('understood') + ' ' + (t('need_more_information') + ' ' + fieldQuestion(voiceSession.missingFields[0])));
    } else {
      pushMsg('bot', t('voice_profile_ready'));
    }
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
      noParseStreak: saved.noParseStreak || 0,
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
  if (reListenTimer) { clearTimeout(reListenTimer); reListenTimer = null; }
  if (recognition) { try { recognition.onend = null; recognition.stop(); } catch (e) {} recognition = null; }
  micBusy = false;
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
  renderTranscript();
  micEligible = !!speechAvailable();
  hideTextFallback();
  if (micEligible) {
    setStatus(t('voice_ready'), 'idle');
    startListening();
  } else {
    setStatus(t('voice_unavailable') + ' ' + t('type_instead'), 'error');
    setMicListening(false);
    showTextFallback();
  }
}

function closeVoiceModal() {
  const modal = document.getElementById('voiceModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  stopRequested = true;
  if (reListenTimer) { clearTimeout(reListenTimer); reListenTimer = null; }
  if (recognition) { try { recognition.stop(); } catch (e) {} }
  micBusy = false;
  setMicListening(false);
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

// ---------- SpeechRecognition (single-shot, user-gesture friendly) ----------

function stopVoiceListening() {
  stopRequested = true;
  if (recognition) { try { recognition.stop(); } catch (e) {} }
  micBusy = false;
  setMicListening(false);
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

// One-shot listen: start the mic, capture ONE utterance, then stop and wait.
// No tight loop, no rapid re-start (root cause of the mobile Chrome stall).
function startListening() {
  if (!voiceSession || !voiceSession.active) return;
  if (micBusy || stopRequested) return;
  if (!speechAvailable() || !micEligible) {
    setStatus(t('voice_unavailable') + ' ' + t('type_instead'), 'error');
    setMicListening(false);
    showTextFallback();
    return;
  }
  micBusy = true;
  stopRequested = false;
  setMicListening(true);
  setStatus(t('voice_listening'), 'listening');
  listenOnce().then(({ text }) => {
    micBusy = false;
    setMicListening(false);
    if (!voiceSession || !voiceSession.active || stopRequested) { setStatus('', ''); return; }
    if (!text) {
      setStatus(t('voice_no_speech'), 'idle');
      return;
    }
    handleUtterance(text, false);
  }).catch((err) => {
    micBusy = false;
    setMicListening(false);
    if (!voiceSession || !voiceSession.active || stopRequested) { setStatus('', ''); return; }
    const code = String(err.message || '');
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      micEligible = false;
      setStatus(t('microphone_denied'), 'error');
      showTextFallback();
    } else if (code === 'no-speech') {
      setStatus(t('voice_no_speech'), 'idle');
    } else if (code === 'audio-capture' || code === 'network' || code === 'unavailable' || code === 'start_error') {
      micEligible = false;
      setStatus(t('voice_mic_error'), 'error');
      showTextFallback();
    } else {
      setStatus(t('voice_error'), 'error');
      showTextFallback();
    }
  });
}

// Re-arm the mic once after the bot's reply so the conversation keeps flowing
// hands-free, but with a guarded delay (no tight loop into a new start()).
function scheduleReListen() {
  if (reListenTimer) { clearTimeout(reListenTimer); reListenTimer = null; }
  if (!voiceSession || !voiceSession.active || !micEligible) return;
  setStatus(t('voice_ready'), 'idle');
  reListenTimer = setTimeout(() => {
    reListenTimer = null;
    if (voiceSession && voiceSession.active && !stopRequested) startListening();
  }, 900);
}

function setMicListening(listening) {
  const btn = document.getElementById('voiceMicBtn');
  if (!btn) return;
  btn.classList.toggle('listening', !!listening);
  btn.setAttribute('aria-pressed', String(!!listening));
  const label = document.getElementById('voiceMicLabel');
  if (label) label.textContent = listening ? t('stop_listening') : t('voice_mic');
}

function toggleVoiceListening() {
  if (micBusy && !stopRequested) {
    stopRequested = true;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    micBusy = false;
    setMicListening(false);
    setStatus(t('voice_ready'), 'idle');
  } else {
    startListening();
  }
}

function toggleVoiceText() {
  const row = document.getElementById('voiceTextRow');
  if (!row) return;
  const show = row.style.display === 'none';
  row.style.display = show ? 'flex' : 'none';
  if (show) {
    const input = document.getElementById('voiceTextInput');
    if (input) { try { input.focus(); } catch (e) {} }
  }
}

function showTextFallback() {
  const row = document.getElementById('voiceTextRow');
  if (row) row.style.display = 'flex';
  const btn = document.getElementById('voiceMicBtn');
  if (btn) btn.classList.add('disabled');
}

function hideTextFallback() {
  const row = document.getElementById('voiceTextRow');
  if (row && !(row.style.display === 'flex' && !micEligible)) row.style.display = 'none';
  const btn = document.getElementById('voiceMicBtn');
  if (btn) btn.classList.remove('disabled');
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
    if (decision.action === 'type') {
      // Gently hand over to typed input instead of repeating the question forever.
      showTextFallback();
      setStatus(t('voice_ready'), 'idle');
      pushMsg('bot', decision.message);
      return;
    }

    if (voiceSession.utteranceCount >= 2 && !isDirect) {
      pushMsg('bot', t('voice_thinking'));
      await sleep(450);
    }
    pushMsg('bot', decision.message);
    scheduleReListen();
  } catch (err) {
    setTyping(false);
    pushMsg('bot', t('voice_error'));
    scheduleReListen();
  }
}

function formatINR(n) {
  try { return '₹' + Math.round(Number(n)).toLocaleString('en-IN'); }
  catch (e) { return '₹' + n; }
}

function decideNext(data, filledCoreNow, isDirect) {
  const wants = !!data.wantsResults;
  const ready = !!data.ready;
  const missing = voiceSession.missingFields;
  const newlyParsed = Object.keys(data.newlyParsed || {}).filter(k => hasValue(data.newlyParsed[k]));
  const incomeMeta = data.incomeMeta || {};

  if (wants && ready) return { action: 'search' };
  if (missing.length === 0) return { action: 'search' };
  if (!isDirect && voiceSession.utteranceCount >= 2 && filledCoreNow) return { action: 'search' };
  if (voiceSession.utteranceCount >= MAX_TURNS) return { action: 'search' };

  if (newlyParsed.length) {
    // A field was understood: confirm naturally (income gets a concrete echo),
    // then move straight to the next open field. Never re-ask the answered field.
    voiceSession.noParseStreak = 0;
    const next = missing[0];
    const parts = [];
    if (newlyParsed.indexOf('income') !== -1 && hasValue(voiceSession.extractedProfile.income)) {
      const tag = (incomeMeta.approx || incomeMeta.annualized) ? 'income_confirm_approx' : 'income_confirm';
      const valueLine = t(tag).replace('{amount}', formatINR(voiceSession.extractedProfile.income));
      parts.push(t('understood') + ' ' + valueLine);
    } else {
      parts.push(t('understood'));
    }
    parts.push(fieldQuestion(next));
    return { action: 'ask', message: parts.join(' ') };
  }

  // Nothing new was understood. First re-ask gently, then give ONE example hint,
  // then (never repeating an apology) hand the user the typed box as an out.
  voiceSession.noParseStreak = (voiceSession.noParseStreak || 0) + 1;
  const next = missing[0];
  const streak = voiceSession.noParseStreak;

  if (streak === 1) {
    return { action: 'ask', message: t('try_again') + ' ' + fieldQuestion(next) };
  }
  if (streak === 2) {
    const hints = FIELD_HINTS[currentLang] || FIELD_HINTS.en;
    return { action: 'ask', message: fieldQuestion(next) + ' ' + (hints[next] || hints.income) };
  }
  voiceSession.noParseStreak = 0;
  return { action: 'type', message: t('voice_pivot_typed') };
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