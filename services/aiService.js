const ENGLISH_STATES = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand',
  'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur',
  'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
  'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura',
  'uttar pradesh', 'uttarakhand', 'west bengal',
  'andaman and nicobar islands', 'chandigarh',
  'dadra and nagar haveli and daman and diu', 'delhi',
  'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry'
];

const STATE_HINDI = {
  'मध्य प्रदेश': 'Madhya Pradesh', 'महाराष्ट्र': 'Maharashtra',
  'उत्तर प्रदेश': 'Uttar Pradesh', 'बिहार': 'Bihar', 'राजस्थान': 'Rajasthan',
  'पंजाब': 'Punjab', 'हरियाणा': 'Haryana', 'गुजरात': 'Gujarat',
  'कर्नाटक': 'Karnataka', 'केरल': 'Kerala', 'तमिलनाडु': 'Tamil Nadu',
  'तेलंगाना': 'Telangana', 'आंध्र प्रदेश': 'Andhra Pradesh',
  'पश्चिम बंगाल': 'West Bengal', 'बंगाल': 'West Bengal',
  'झारखंड': 'Jharkhand', 'छत्तीसगढ़': 'Chhattisgarh',
  'उत्तराखंड': 'Uttarakhand', 'हिमाचल प्रदेश': 'Himachal Pradesh',
  'जम्मू कश्मीर': 'Jammu and Kashmir', 'जम्मू-कश्मीर': 'Jammu and Kashmir',
  'ओडिशा': 'Odisha', 'उड़ीसा': 'Odisha', 'असम': 'Assam',
  'मेघालय': 'Meghalaya', 'अरुणाचल प्रदेश': 'Arunachal Pradesh',
  'नागालैंड': 'Nagaland', 'मणिपुर': 'Manipur', 'मिजोरम': 'Mizoram',
  'त्रिपुरा': 'Tripura', 'सिक्किम': 'Sikkim', 'गोवा': 'Goa',
  'दिल्ली': 'Delhi', 'चंडीगढ़': 'Chandigarh', 'लद्दाख': 'Ladakh',
  'पुदुचेरी': 'Puducherry', 'लक्षद्वीप': 'Lakshadweep',
  'अंडमान': 'Andaman and Nicobar Islands'
};

const FIELD_ORDER = ['occupation', 'age', 'income', 'gender', 'category', 'state'];

function hasValue(v) {
  return v !== null && v !== undefined && v !== '';
}

function titleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractProfile(lower) {
  const parsed = {};

  const femaleWords = /(mahila|aurat|ladki|beti|woman|female|girl|महिला|औरत|लड़की|बेटी)/;
  const maleWords = /(purush|aadmi|ladka|man|boy|male|पुरुष|आदमी|लड़का)/;
  if (femaleWords.test(lower)) parsed.gender = 'female';
  else if (maleWords.test(lower)) parsed.gender = 'male';
  else if (/^(main|मैं)\s/.test(lower)) {
    if (/(kisan|farmer|student|छात्र|किसान|unemployed|बेरोज़गार|retired)/.test(lower)) parsed.gender = 'male';
  }

  let age = null;
  const m1 = lower.match(/(\d+)\s*(saal|साल|years?|yrs?)/);
  const m2 = lower.match(/(umar|उम्र|उमर|age)\s*[:(\s]*(\d+)/);
  if (m1) age = parseInt(m1[1], 10);
  else if (m2) age = parseInt(m2[2], 10);
  if (age !== null) parsed.age = Math.min(120, age);

  let income = null;
  // note: \b is ASCII-only (Devanagari is not \w), so use a "not followed by non-space"
  // boundary instead so "3 lakh" AND "3 लाख" both parse.
  const im1 = lower.match(/(\d+)\s*(?:lakh|लाख)(?!\S)/);
  const im2 = lower.match(/(\d+)\s*(?:hazaar|hajar|thousand|हज़ार|हजार)(?!\S)/);
  if (im1) income = parseInt(im1[1], 10) * 100000;
  else if (im2) income = parseInt(im2[1], 10) * 1000;
  else {
    const im3 = lower.match(/₹\s*([\d,.]+)/);
    if (im3) income = parseInt(im3[1].replace(/,/g, ''), 10);
  }
  if (income !== null) parsed.income = income;

  for (const s of ENGLISH_STATES) {
    if (lower.includes(s)) { parsed.state = titleCase(s); break; }
  }
  if (!parsed.state) {
    for (const hindi of Object.keys(STATE_HINDI)) {
      if (lower.includes(hindi)) { parsed.state = STATE_HINDI[hindi]; break; }
    }
  }

  if (/(kisan|kheti|farmer|खेती|किसान)/.test(lower)) parsed.occupation = 'kisan';
  else if (/(vidyarthi|student|छात्र|पढ़ाई|padhai|college|school)/.test(lower)) parsed.occupation = 'student';
  else if (/(naukri|job|employee|karmchari|sarkari|नौकरी|कर्मचारी)/.test(lower)) parsed.occupation = 'naukri';
  else if (/(vyavasaya|vyapaar|busine|व्यवसाय|व्यापार)/.test(lower)) parsed.occupation = 'vyavasaya';
  else if (/(mazdoor|labour|मज़दूर|मजदूर)/.test(lower)) parsed.occupation = 'mazdoor';
  else if (/(retired|sevanivrut|सेवानिवृत्त|retire)/.test(lower)) parsed.occupation = 'retired';
  else if (/(berozgar|berojgar|unemployed|बेरोज़गार|बेरोजगार)/.test(lower)) parsed.occupation = 'other';

  const cat = lower.match(/\b(sc|st|obc|ews|general)\b/);
  if (cat) parsed.category = cat[1];
  if (!parsed.category) {
    if (lower.includes('सामान्य')) parsed.category = 'general';
    if (lower.includes('अनुसूचित जाति')) parsed.category = 'sc';
    if (lower.includes('अनुसूचित जनजाति')) parsed.category = 'st';
    if (lower.includes('पिछड़ा') || lower.includes('ओबीसी')) parsed.category = 'obc';
  }

  return parsed;
}

function mergeProfile(known, parsed) {
  const out = { ...(known || {}) };
  Object.keys(parsed).forEach(k => {
    if (hasValue(parsed[k])) out[k] = parsed[k];
  });
  return out;
}

function computeMissingFields(profile) {
  return FIELD_ORDER.filter(f => !hasValue(profile[f]));
}

function detectIntent(lower) {
  if (/(योजना|yojna|scheme|सहायता|मदद|benefit|लाभ|आवेदन|aavedan|apply|zaroorat|need)/.test(lower)) {
    return 'scheme_assistance';
  }
  return 'chat';
}

function detectWantsResults(lower) {
  return /(दिखाओ|खोजो|सूची|बताइए|बताओ|search|show|list|find|recommend|suggest|kaunsa|कौनसा|कौन सा|eligible|पात्र)/.test(lower);
}

async function parseVoiceIntent(text, language, known) {
  const lower = String(text || '').toLowerCase();
  const parsed = extractProfile(lower);
  const profile = mergeProfile(known, parsed);
  const wantsResults = detectWantsResults(lower);
  const intent = detectIntent(lower);
  const missingFields = computeMissingFields(profile);
  const coreFields = ['occupation', 'age', 'income', 'gender', 'category'];
  const filledCore = coreFields.filter(f => hasValue(profile[f])).length;
  const ready = filledCore >= 3 || wantsResults || missingFields.length === 0;

  return {
    intent,
    profile,
    newlyParsed: parsed,
    missingFields,
    ready,
    wantsResults,
    query: text
  };
}

async function processVoice(text) {
  const result = await parseVoiceIntent(text);
  return result.profile;
}

async function callAiAssistant(text, opts = {}) {
  const key = process.env.AI_API_KEY;
  const endpoint = process.env.AI_ENDPOINT || process.env.AI_API_URL;
  if (!key || !endpoint) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        text: String(text || ''),
        language: opts.language || 'hi',
        known: opts.known || null
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' ? data : null;
  } catch (e) {
    return null;
  }
}

module.exports = { processVoice, parseVoiceIntent, callAiAssistant };