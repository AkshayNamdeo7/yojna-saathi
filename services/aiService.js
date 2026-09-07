async function processVoice(text) {
  const profile = {};
  const lower = text.toLowerCase();

  if (lower.startsWith('main') && lower.includes('kisan') && !/(main|hun|haan|hain|hoon|hein)\s*(mahila|aurat|beti|ladki)/.test(lower)) {
    profile.gender = 'male';
  }

  const ageMatch = lower.match(/(\d+)\s*saal|umar\s*(\d+)|age\s*(\d+)/);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
  }

  const incomeMatch = lower.match(/(\d+)\s*(lakh|hazaar|thousand|million|₹)/);
  if (incomeMatch) {
    let inc = parseInt(incomeMatch[1]);
    if (incomeMatch[2] === 'lakh') inc *= 100000;
    else if (incomeMatch[2] === 'hazaar' || incomeMatch[2] === 'thousand') inc *= 1000;
    profile.income = inc;
  }

  const states = ['andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh',
    'goa','gujarat','haryana','himachal pradesh','jharkhand',
    'karnataka','kerala','madhya pradesh','maharashtra','manipur',
    'meghalaya','mizoram','nagaland','odisha','punjab',
    'rajasthan','sikkim','tamil nadu','telangana','tripura',
    'uttar pradesh','uttarakhand','west bengal','delhi'];
  for (const s of states) {
    if (lower.includes(s)) {
      profile.state = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  if (lower.includes('mahila') || lower.includes('aurat') || lower.includes('ladki')) {
    profile.gender = 'female';
  } else if (lower.includes('purush') || lower.includes('aadmi') || lower.includes('ladka')) {
    profile.gender = 'male';
  }

  if (lower.includes('kisan') || lower.includes('kheti') || lower.includes('farmer')) {
    profile.occupation = 'kisan';
  } else if (lower.includes('student') || lower.includes('vidyarthi') || lower.includes('padhai')) {
    profile.occupation = 'student';
  } else if (lower.includes('naukri') || lower.includes('job') || lower.includes('employee')) {
    profile.occupation = 'naukri';
  } else if (lower.includes('vyavasaya') || lower.includes('business')) {
    profile.occupation = 'vyavasaya';
  } else if (lower.includes('mazdoor') || lower.includes('labour')) {
    profile.occupation = 'mazdoor';
  }

  if (lower.includes('sc') || lower.includes('st') || lower.includes('obc') || lower.includes('general')) {
    if (lower.includes('sc')) profile.category = 'sc';
    else if (lower.includes('st')) profile.category = 'st';
    else if (lower.includes('obc')) profile.category = 'obc';
    else profile.category = 'general';
  }

  return profile;
}

module.exports = { processVoice };
