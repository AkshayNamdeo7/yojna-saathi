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

// -------------------------------------------------------------------------
// Natural-language number + slot understanding.
// Handles Hindi words, Hindi/English mixes, ASR spelling variation, commas,
// fractions (डेढ़/सवा/पौने/साढ़े), lakh-thousand compounding and month->annual
// conversion. Context (which field is being asked) helps disambiguate bare
// numbers, so a user never has to repeat a preset phrase.
// -------------------------------------------------------------------------

const NUM_WORDS = {
  'शून्य': 0, 'सिफर': 0, 'zero': 0, 'naught': 0,
  'एक': 1, 'एक्का': 1, 'इक': 1, 'ek': 1, 'one': 1,
  'दो': 2, 'do': 2, 'two': 2,
  'तीन': 3, 'तिन': 3, 'teen': 3, 'three': 3,
  'चार': 4, 'chaar': 4, 'char': 4, 'four': 4,
  'पांच': 5, 'पाँच': 5, 'पंच': 5, 'paanch': 5, 'panch': 5, 'five': 5,
  'छ': 6, 'छः': 6, 'छह': 6, 'chhe': 6, 'chah': 6, 'six': 6,
  'सात': 7, 'saat': 7, 'seven': 7,
  'आठ': 8, 'aath': 8, 'eight': 8,
  'नौ': 9, 'नव': 9, 'nau': 9, 'nine': 9,
  'दस': 10, 'das': 10, 'ten': 10,
  'ग्यारह': 11, 'एग्यारह': 11, 'gyarah': 11, 'gyara': 11, 'eleven': 11,
  'बारह': 12, 'बारा': 12, 'barah': 12, 'baarah': 12, 'twelve': 12,
  'तेरह': 13, 'तेरा': 13, 'terah': 13, 'thirteen': 13,
  'चौदह': 14, 'चौदा': 14, 'chaudah': 14, 'fourteen': 14,
  'पंद्रह': 15, 'पन्द्रह': 15, 'पंदरा': 15, 'pandrah': 15, 'fifteen': 15,
  'सोलह': 16, 'solah': 16, 'sixteen': 16,
  'सत्रह': 17, 'satrah': 17, 'seventeen': 17,
  'अठारह': 18, 'अठारा': 18, 'atharah': 18, 'eighteen': 18,
  'उन्नीस': 19, 'उनिस': 19, 'unnis': 19, 'nineteen': 19,
  'बीस': 20, 'बिस': 20, 'bees': 20, 'beesh': 20, 'bis': 20, 'twenty': 20,
  'इक्कीस': 21, 'ikis': 21, 'ikkiys': 21, 'twenty-one': 21, 'twenty one': 21,
  'बाईस': 22, 'bais': 22, 'twenty-two': 22, 'twenty two': 22,
  'तेईस': 23, 'teis': 23, 'twenty-three': 23, 'twenty three': 23,
  'चौबीस': 24, 'chaubis': 24, 'twenty-four': 24, 'twenty four': 24,
  'पच्चीस': 25, 'पचीस': 25, 'pachis': 25, 'twenty-five': 25, 'twenty five': 25,
  'छब्बीस': 26, 'chhabis': 26, 'twenty-six': 26, 'twenty six': 26,
  'सत्ताईस': 27, 'sattais': 27, 'twenty-seven': 27, 'twenty seven': 27,
  'अट्ठाईस': 28, 'atthais': 28, 'atees': 28, 'twenty-eight': 28, 'twenty eight': 28,
  'उनतीस': 29, 'untis': 29, 'unatis': 29, 'twenty-nine': 29, 'twenty nine': 29,
  'तीस': 30, 'tees': 30, 'thirty': 30,
  'इकतीस': 31, 'iktiis': 31, 'thirty-one': 31, 'thirty one': 31,
  'बत्तीस': 32, 'battis': 32, 'thirty-two': 32, 'thirty two': 32,
  'तैंतीस': 33, 'tentis': 33, 'thirty-three': 33, 'thirty three': 33,
  'चौंतीस': 34, 'chautis': 34, 'thirty-four': 34, 'thirty four': 34,
  'पैंतीस': 35, 'pantis': 35, 'thirty-five': 35, 'thirty five': 35,
  'छत्तीस': 36, 'chhattis': 36, 'thirty-six': 36, 'thirty six': 36,
  'सैंतीस': 37, 'saintis': 37, 'thirty-seven': 37, 'thirty seven': 37,
  'अड़तीस': 38, 'adattis': 38, 'thirty-eight': 38, 'thirty eight': 38,
  'उनतालीस': 39, 'untalis': 39, 'thirty-nine': 39, 'thirty nine': 39,
  'चालीस': 40, 'chalis': 40, 'chaalis': 40, 'forty': 40,
  'इकतालीस': 41, 'ikatalis': 41, 'forty-one': 41, 'forty one': 41,
  'बयालीस': 42, 'bayalis': 42, 'forty-two': 42, 'forty two': 42,
  'तैंतालीस': 43, 'tentalis': 43, 'forty-three': 43, 'forty three': 43,
  'चवालीस': 44, 'chavalis': 44, 'forty-four': 44, 'forty four': 44,
  'पैंतालीस': 45, 'पेंतालीस': 45, 'paintalis': 45, 'pentaalis': 45, 'forty-five': 45, 'forty five': 45,
  'छियालीस': 46, 'chiyalis': 46, 'forty-six': 46, 'forty six': 46,
  'सैंतालीस': 47, 'saintalis': 47, 'forty-seven': 47, 'forty seven': 47,
  'अड़तालीस': 48, 'adatalis': 48, 'forty-eight': 48, 'forty eight': 48,
  'उनचास': 49, 'unachas': 49, 'forty-nine': 49, 'forty nine': 49,
  'पचास': 50, 'pachaas': 50, 'pachas': 50, 'pacha': 50, 'fifty': 50,
  'इक्यावन': 51, 'ikyavan': 51, 'fifty-one': 51, 'fifty one': 51,
  'बावन': 52, 'bavan': 52, 'fifty-two': 52, 'fifty two': 52,
  'तिरेपन': 53, 'तिरपन': 53, 'tirpan': 53, 'fifty-three': 53, 'fifty three': 53,
  'चौवन': 54, 'chauvan': 54, 'fifty-four': 54, 'fifty four': 54,
  'पचपन': 55, 'pachpan': 55, 'fifty-five': 55, 'fifty five': 55,
  'छप्पन': 56, 'chappan': 56, 'fifty-six': 56, 'fifty six': 56,
  'सत्तावन': 57, 'sattavan': 57, 'fifty-seven': 57, 'fifty seven': 57,
  'अट्ठावन': 58, 'atthavan': 58, 'fifty-eight': 58, 'fifty eight': 58,
  'उनसठ': 59, 'unsath': 59, 'fifty-nine': 59, 'fifty nine': 59,
  'साठ': 60, 'saath': 60, 'sixty': 60,
  'इकसठ': 61, 'iksath': 61, 'sixty-one': 61, 'sixty one': 61,
  'बासठ': 62, 'basath': 62, 'sixty-two': 62, 'sixty two': 62,
  'तिरसठ': 63, 'tirsath': 63, 'sixty-three': 63, 'sixty three': 63,
  'चौंसठ': 64, 'chausath': 64, 'sixty-four': 64, 'sixty four': 64,
  'पैंसठ': 65, 'pansath': 65, 'sixty-five': 65, 'sixty five': 65,
  'छियासठ': 66, 'chiyasath': 66, 'sixty-six': 66, 'sixty six': 66,
  'सड़सठ': 67, 'sadasath': 67, 'sixty-seven': 67, 'sixty seven': 67,
  'अड़सठ': 68, 'adasath': 68, 'sixty-eight': 68, 'sixty eight': 68,
  'उनहत्तर': 69, 'unahattar': 69, 'unhattar': 69, 'sixty-nine': 69, 'sixty nine': 69,
  'सत्तर': 70, 'sattar': 70, 'seventy': 70,
  'इकहत्तर': 71, 'ikahattar': 71, 'seventy-one': 71, 'seventy one': 71,
  'बहत्तर': 72, 'bahattar': 72, 'seventy-two': 72, 'seventy two': 72,
  'तिहत्तर': 73, 'tihattar': 73, 'seventy-three': 73, 'seventy three': 73,
  'चौहत्तर': 74, 'chauhattar': 74, 'seventy-four': 74, 'seventy four': 74,
  'पचहत्तर': 75, 'pachahattar': 75, 'seventy-five': 75, 'seventy five': 75,
  'छिहत्तर': 76, 'chihhattar': 76, 'seventy-six': 76, 'seventy six': 76,
  'सतहत्तर': 77, 'satahattar': 77, 'seventy-seven': 77, 'seventy seven': 77,
  'अठहत्तर': 78, 'athahattar': 78, 'seventy-eight': 78, 'seventy eight': 78,
  'उन्यासी': 79, 'uniyasi': 79, 'seventy-nine': 79, 'seventy nine': 79,
  'अस्सी': 80, 'assi': 80, 'asi': 80, 'eighty': 80,
  'इक्यासी': 81, 'ikyasi': 81, 'eighty-one': 81, 'eighty one': 81,
  'बयासी': 82, 'bayasi': 82, 'eighty-two': 82, 'eighty two': 82,
  'तिरासी': 83, 'tiraasi': 83, 'eighty-three': 83, 'eighty three': 83,
  'चौरासी': 84, 'chaurasi': 84, 'eighty-four': 84, 'eighty four': 84,
  'पचासी': 85, 'pachasi': 85, 'eighty-five': 85, 'eighty five': 85,
  'छियासी': 86, 'chiyasi': 86, 'eighty-six': 86, 'eighty six': 86,
  'सत्तासी': 87, 'sattasi': 87, 'eighty-seven': 87, 'eighty seven': 87,
  'अठासी': 88, 'athasi': 88, 'eighty-eight': 88, 'eighty eight': 88,
  'नवासी': 89, 'navasi': 89, 'eighty-nine': 89, 'eighty nine': 89,
  'नब्बे': 90, 'nabbe': 90, 'nabbey': 90, 'ninety': 90,
  'इक्यानवे': 91, 'ikyanave': 91, 'ninety-one': 91, 'ninety one': 91,
  'बानवे': 92, 'banave': 92, 'ninety-two': 92, 'ninety two': 92,
  'तिरानवे': 93, 'tiranave': 93, 'ninety-three': 93, 'ninety three': 93,
  'चौरानवे': 94, 'chauranave': 94, 'ninety-four': 94, 'ninety four': 94,
  'पचानवे': 95, 'pachanave': 95, 'ninety-five': 95, 'ninety five': 95,
  'छियानवे': 96, 'chiyanave': 96, 'ninety-six': 96, 'ninety six': 96,
  'सत्तानवे': 97, 'sattanave': 97, 'ninety-seven': 97, 'ninety seven': 97,
  'अट्ठानवे': 98, 'atthanave': 98, 'ninety-eight': 98, 'ninety eight': 98,
  'निन्यानवे': 99, 'ninyanave': 99, 'ninety-nine': 99, 'ninety nine': 99,
  // fraction value words (stand-alone: सवा लाख / डेढ़ लाख / आधा etc.)
  'सवा': 1.25, 'sava': 1.25, 'sawa': 1.25,
  'डेढ़': 1.5, 'dedh': 1.5,
  'ढाई': 2.5, 'अढ़ाई': 2.5, 'adhai': 2.5, 'arhai': 2.5,
  'आधा': 0.5, 'adha': 0.5, 'half': 0.5,
  'पाव': 0.25, 'pav': 0.25
};

// prefix fractions that qualify the next number word: साढ़े तीन = 3.5, पौने दो = 1.75
const FRAC_PREFIXES = {
  'साढ़े': 0.5, 'saade': 0.5,
  'पौने': -0.25, 'पौ': -0.25, 'poune': -0.25
};

const SCALES = {
  'सौ': 100, 'सैकड़ा': 100, 'sau': 100, 'hundred': 100, 'hundreds': 100,
  'हज़ार': 1000, 'हजार': 1000, 'हजारा': 1000,
  'hazaar': 1000, 'hazar': 1000, 'hajar': 1000, 'hajaar': 1000, 'thousand': 1000,
  'लाख': 100000, 'लख': 100000, 'lakh': 100000, 'lack': 100000,
  'करोड़': 10000000, 'crore': 10000000, 'karod': 10000000
};

const RX_MONEY = /(?:₹|रुपये|रुपया|रुप्या|रुपए|कमाते?|कमाई|कमाना|आय|इनकम|income|earn|salary|सैलरी|तनख्वाह|वेतन|पगार|wage|wages)/;
const RX_APPROX = /(?:करीब|क़रीब|लगभग|आसपास|करीबन|approx|around|about|nearly|almost|roughly|lagbhag)/;
const RX_MONTH = /(?:महीना|महीने|महिना|महिने|माह|मासिक|monthly?|per\s*month|प्रति\s*माह)/;
const RX_YEAR = /(?:सालाना|वर्ष|साल|annual|annualy|yearly?|per\s*year|annually|सालाना\b)/;
const RX_AGE = /(?:उम्र|उमर|age|years?|saal?|साल|वर्ष|old|born)/;

// build dictionaries used to tokenise matched number clauses
const TOKEN_DICT = [];
function isLatinWord(w) { return /^[a-z]+$/.test(w); }
['num', 'scale'].forEach(kind => {
  const map = kind === 'num' ? NUM_WORDS : SCALES;
  Object.keys(map).sort((a, b) => b.length - a.length).forEach(key => {
    TOKEN_DICT.push({ key, type: kind, val: map[key], latin: isLatinWord(key) });
  });
});
Object.keys(FRAC_PREFIXES).sort((a, b) => b.length - a.length).forEach(key => {
  TOKEN_DICT.push({ key, type: 'frac', delta: FRAC_PREFIXES[key], latin: isLatinWord(key) });
});

function digitSrc() { return '[0-9][0-9,]*(?:\\.[0-9]+)?'; }
const SUB_VAL = '(?:' + Object.keys(NUM_WORDS).sort((a, b) => b.length - a.length).join('|') + ')';
const SUB_FRAC = '(?:' + Object.keys(FRAC_PREFIXES).sort((a, b) => b.length - a.length).join('|') + ')';
const SUB_SCALE = '(?:' + Object.keys(SCALES).sort((a, b) => b.length - a.length).join('|') + ')';
const SUB_DATA = '(?:' + SUB_FRAC + '\\s*)?(?:' + SUB_VAL + '|' + digitSrc() + ')';
const CLAUSE_RE = new RegExp(
  SUB_DATA + '(?:\\s*(?:' + SUB_SCALE + ')\\s*(?:' + SUB_DATA + ')?\\s*(?:' + SUB_SCALE + ')?)?',
  'g'
);

function tokenizeClause(s) {
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9]/.test(ch)) {
      const m = s.slice(i).match(/^\d[\d,]*(?:\.\d+)?/);
      if (!m) { i++; continue; }
      toks.push({ type: 'digit', val: parseFloat(m[0].replace(/,/g, '')) });
      i += m[0].length;
      continue;
    }
    let hit = null;
    for (const e of TOKEN_DICT) {
      if (s.startsWith(e.key, i)) {
        if (e.latin) {
          const nx = s[i + e.key.length];
          if (nx && /[a-z]/.test(nx)) continue; // word boundary for latin texts
        }
        hit = e;
        break;
      }
    }
    if (hit) { toks.push({ type: hit.type, val: hit.val, delta: hit.delta }); i += hit.key.length; continue; }
    i++;
  }
  return toks;
}

function evalTokens(toks) {
  let total = 0;
  let cur = 0;
  let hasScale = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.type === 'num' || t.type === 'digit') cur += t.val;
    else if (t.type === 'frac') {
      const n = toks[i + 1];
      if (n && (n.type === 'num' || n.type === 'digit')) { cur += n.val + t.delta; i++; }
      else cur += t.delta;
    } else if (t.type === 'scale') {
      hasScale = true;
      total += (cur === 0 ? 1 : cur) * t.val;
      cur = 0;
    }
  }
  return { value: total + cur, hasScale };
}

function findClauses(lower) {
  const out = [];
  let m;
  while ((m = CLAUSE_RE.exec(lower)) !== null) {
    const raw = m[0].trim();
    if (raw.length === 0) { m.lastIndex++; continue; }
    const toks = tokenizeClause(raw);
    if (!toks.length) continue;
    const { value, hasScale } = evalTokens(toks);
    if (!isFinite(value)) continue;
    out.push({ start: m.index, end: m.lastIndex, raw, value, hasScale, toks });
  }
  return out;
}

function dist(start, idx) { return Math.abs(start - idx); }

function nearestAnchor(clauses, lower) {
  const money = lower.search(RX_MONEY);
  if (money >= 0) return money;
  const age = lower.search(RX_AGE);
  if (age >= 0) return age;
  return null;
}

function pickIncomeClause(clauses, lower) {
  const scaled = clauses.filter(c => c.hasScale);
  if (scaled.length === 1) return scaled[0];
  const anchor = nearestAnchor(clauses, lower);
  if (anchor !== null && clauses.length) {
    return clauses.reduce((a, b) => (dist(a.start, anchor) <= dist(b.start, anchor) ? a : b));
  }
  if (scaled.length > 1) return scaled[scaled.length - 1];
  if (clauses.length === 1) return clauses[0];
  const plausible = clauses.filter(c => c.value >= 500 && c.value <= 1e9);
  return plausible.length ? plausible[plausible.length - 1] : clauses[clauses.length - 1];
}

function resolveIncome(clauses, lower) {
  if (!clauses.length) return null;
  const clause = pickIncomeClause(clauses, lower);
  if (clause.value == null || clause.value > 1e9) return null;
  const approx = RX_APPROX.test(lower);
  const monthOk = RX_MONTH.test(lower);
  const yearOk = RX_YEAR.test(lower);
  const annualized = monthOk && !yearOk;
  const value = annualized ? Math.round(clause.value * 12) : Math.round(clause.value);
  return {
    value,
    meta: { approx, annualized, monthly: annualized ? clause.value : null }
  };
}

function resolveAge(clauses, lower, expectedAge) {
  const cands = clauses.filter(c => !c.hasScale && c.value >= 1 && c.value <= 120);
  if (!cands.length) return null;
  const ageWords = [];
  for (const re of [/(उम्र|उमर|age|saal|साल|वर्ष)/g, /\b(years?|old)\b/gi]) {
    let m;
    while ((m = re.exec(lower)) !== null) ageWords.push(m.index);
  }
  if (ageWords.length) {
    const nearest = cands.reduce((a, b) => {
      const da = Math.min(...ageWords.map(w => dist(a.start, w)));
      const db = Math.min(...ageWords.map(w => dist(b.start, w)));
      return da <= db ? a : b;
    });
    return nearest.value <= 120 ? nearest.value : null;
  }
  if (expectedAge) {
    const ok = cands.filter(c => c.value >= 13 && c.value <= 100);
    return ok.length ? ok[0].value : (cands.length && cands[0].value <= 120 ? cands[0].value : null);
  }
  return null;
}

const STATE_ALT = {
  'एमपी': 'Madhya Pradesh', 'm.p': 'Madhya Pradesh', 'mp': 'Madhya Pradesh',
  'मध्यप्रदेश': 'Madhya Pradesh',
  'यूपी': 'Uttar Pradesh', 'उप्र': 'Uttar Pradesh', 'उ.प्र': 'Uttar Pradesh', 'u.p': 'Uttar Pradesh', 'up': 'Uttar Pradesh',
  'उत्तरप्रदेश': 'Uttar Pradesh',
  'तमिलनाडू': 'Tamil Nadu', 'तमिलनाडु': 'Tamil Nadu',
  'आन्ध्र प्रदेश': 'Andhra Pradesh',
  'झारखंड': 'Jharkhand', 'झारखण्ड': 'Jharkhand',
  'छत्तीसगढ़': 'Chhattisgarh', 'छत्तीसगढ': 'Chhattisgarh',
  'उत्तराखंड': 'Uttarakhand', 'उत्तराखण्ड': 'Uttarakhand',
  'हिमांचल प्रदेश': 'Himachal Pradesh', 'हिमाचलप्रदेश': 'Himachal Pradesh',
  'बंगाल': 'West Bengal',
  'दिल्ली': 'Delhi', 'चंडीगढ़': 'Chandigarh',
  'जम्मू-कश्मीर': 'Jammu and Kashmir', 'जम्मू कश्मीर': 'Jammu and Kashmir',
  'अण्डमान': 'Andaman and Nicobar Islands', 'अंडमान': 'Andaman and Nicobar Islands'
};

function extractProfile(lower, opts) {
  const expected = opts && opts.expected;
  const parsed = {};
  let incomeMeta = null;

  const clauses = findClauses(lower);
  const moneyCtx = RX_MONEY.test(lower);
  const hasScaleClause = clauses.some(c => c.hasScale);

  // ---- income (currency keyed + expected field + any lakh/hazaar-scaled number) ----
  if (expected === 'income' || moneyCtx || hasScaleClause) {
    const inc = resolveIncome(clauses, lower);
    if (inc) { parsed.income = inc.value; incomeMeta = inc.meta; }
  }

  // ---- age (context words or the exact "age" slot) ----
  const age = resolveAge(clauses, lower, expected === 'age');
  if (age !== null && hasValue(age)) parsed.age = Math.min(120, Math.round(age));

  // ---- gender ----
  const femaleWords = /(mahila|aurat|ladki|beti|woman|female|girl|महिला|औरत|लड़की|बेटी|स्त्री)/;
  const maleWords = /(purush|aadmi|ladka|man|boy|male|पुरुष|आदमी|लड़का)/;
  if (femaleWords.test(lower)) parsed.gender = 'female';
  else if (maleWords.test(lower)) parsed.gender = 'male';
  else if (/^(main|मैं)\s/.test(lower)) {
    if (/(kisan|farmer|student|छात्र|किसान|unemployed|बेरोज़गार|retired)/.test(lower)) parsed.gender = 'male';
  }

  // ---- state (full names + abbreviations + common formats) ----
  for (const s of ENGLISH_STATES) {
    if (lower.includes(s)) { parsed.state = titleCase(s); break; }
  }
  if (!parsed.state) {
    for (const hindi of Object.keys(STATE_HINDI)) {
      if (lower.includes(hindi)) { parsed.state = STATE_HINDI[hindi]; break; }
    }
  }
  if (!parsed.state) {
    for (const alt of Object.keys(STATE_ALT)) {
      if (new RegExp('(^|[^a-z])' + alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)', 'i').test(lower)) {
        parsed.state = STATE_ALT[alt]; break;
      }
    }
  }

  // ---- occupation ----
  if (/(kisan|kheti|farmer|खेती|किसान|किसानी)/.test(lower)) parsed.occupation = 'kisan';
  else if (/(vidyarthi|student|छात्र|पढ़ाई|padhai|college|school|विद्यार्थी)/.test(lower)) parsed.occupation = 'student';
  else if (/(naukri|job|employee|karmchari|sarkari|नौकरी|नौकरीपेशा|कर्मचारी)/.test(lower)) parsed.occupation = 'naukri';
  else if (/(vyavasaya|vyapaar|busine|व्यवसाय|व्यापार|doom|shop)/.test(lower)) parsed.occupation = 'vyavasaya';
  else if (/(mazdoor|labour|मज़दूर|मजदूर|श्रमिक|कामगार)/.test(lower)) parsed.occupation = 'mazdoor';
  else if (/(retired|sevanivrut|सेवानिवृत्त|retire)/.test(lower)) parsed.occupation = 'retired';
  else if (/(berozgar|berojgar|unemployed|बेरोज़गार|बेरोजगार|कोई काम नहीं)/.test(lower)) parsed.occupation = 'other';

  // ---- category ----
  const cat = lower.match(/\b(sc|st|obc|ews|general)\b/);
  if (cat) parsed.category = cat[1];
  if (!parsed.category) {
    if (lower.includes('सामान्य') || lower.includes('जनरल')) parsed.category = 'general';
    if (lower.includes('अनुसूचित जाति')) parsed.category = 'sc';
    if (lower.includes('अनुसूचित जनजाति')) parsed.category = 'st';
    if (lower.includes('पिछड़ा') || lower.includes('ओबीसी') || lower.includes('backward')) parsed.category = 'obc';
  }

  return { parsed, incomeMeta };
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
  const knownProfile = mergeProfile(known, {});
  const expected = computeMissingFields(knownProfile)[0] || null;
  const { parsed, incomeMeta } = extractProfile(lower, { expected });
  const profile = mergeProfile(knownProfile, parsed);
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
    incomeMeta: incomeMeta || null,
    approximations: incomeMeta && incomeMeta.approx ? ['income'] : [],
    missingFields,
    ready,
    wantsResults,
    expected,
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