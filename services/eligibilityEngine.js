function checkEligibility(profile, schemes) {
  const results = [];
  const p = {
    age: profile.age ? parseInt(profile.age) : null,
    state: profile.state || null,
    district: profile.district || null,
    gender: profile.gender || null,
    occupation: profile.occupation || null,
    income: profile.income ? parseInt(profile.income) : null,
    category: profile.category || null
  };

  for (const scheme of schemes) {
    if (scheme.status !== 'active') continue;
    const rules = scheme.eligibilityRules;
    const reasons = [];
    let eligible = true;
    let potential = false;

    if (rules.ageMin && p.age !== null) {
      if (p.age < rules.ageMin) {
        eligible = false;
        reasons.push(`Umar kam se kam ${rules.ageMin} saal honi chahiye`);
      } else {
        potential = true;
      }
    }
    if (rules.ageMax && p.age !== null) {
      if (p.age > rules.ageMax) {
        eligible = false;
        reasons.push(`Umar ${rules.ageMax} saal se zyada nahi honi chahiye`);
      } else {
        potential = true;
      }
    }
    if (rules.gender && rules.gender !== 'all' && p.gender) {
      if (p.gender !== rules.gender) {
        if (rules.gender === 'female') {
          eligible = false;
          reasons.push('Yeh yojana kewal mahilaon ke liye hai');
        } else {
          eligible = false;
          reasons.push('Yeh yojana kewal purushon ke liye hai');
        }
      }
    }
    if (rules.category && rules.category !== 'all' && p.category) {
      const allowed = rules.category.split('/').map(c => c.toLowerCase());
      if (!allowed.includes(p.category.toLowerCase())) {
        eligible = false;
        reasons.push(`Yeh yojana ${rules.category.toUpperCase()} ke liye hai`);
      }
    }
    if (rules.incomeMax !== null && rules.incomeMax !== undefined && p.income !== null) {
      if (p.income > rules.incomeMax) {
        eligible = false;
        reasons.push(`Aay ₹${(rules.incomeMax / 1000).toFixed(0)} lakh se kam honi chahiye`);
      }
    }
    if (rules.occupation && p.occupation) {
      const allowedOcc = rules.occupation.map(o => o.toLowerCase());
      if (!allowedOcc.includes(p.occupation.toLowerCase())) {
        eligible = false;
        reasons.push(`Yeh yojana ${rules.occupation.join(' ya ')} ke liye hai`);
      }
    }

    let matchLevel = 'not_eligible';
    if (eligible) {
      const filledFields = [p.age, p.gender, p.occupation, p.income, p.category].filter(v => v !== null && v !== undefined).length;
      if (filledFields >= 3 && potential) {
        matchLevel = 'likely_eligible';
      } else if (filledFields >= 1) {
        matchLevel = 'possibly_eligible';
      } else {
        matchLevel = 'check_eligibility';
      }
    }

    results.push({
      scheme,
      eligible,
      matchLevel,
      reasons: eligible ? [] : reasons,
      message: eligible
        ? 'Aap is yojna ke liye patr ho sakte hain.'
        : reasons.length > 0
          ? reasons.join('; ')
          : 'Aap abhi is yojna ke liye patr nahi hain.'
    });
  }

  results.sort((a, b) => {
    const order = { likely_eligible: 0, possibly_eligible: 1, check_eligibility: 2, not_eligible: 3 };
    return order[a.matchLevel] - order[b.matchLevel];
  });

  return results;
}

module.exports = { checkEligibility };
