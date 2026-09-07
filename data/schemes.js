const schemes = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    shortDescription: "Kisano ko seedha aarthik sahayata",
    benefit: "Pratyek varsh ₹6,000 (teen kiston mein ₹2,000)",
    category: "kisan",
    state: "all",
    eligibilityRules: {
      occupation: ["kisan", "kisan_majdoor"],
      ageMin: 18,
      incomeMax: null,
      gender: "all",
      category: "all",
      conditions: ["Should be a farmer family with cultivable land"]
    },
    requiredDocuments: ["aadhaar", "bank_account_details", "land_records"],
    officialApplicationUrl: "https://pmkisan.gov.in/",
    officialSourceUrl: "https://pmkisan.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-awas-gramin",
    name: "Pradhan Mantri Awaas Yojana - Gramin",
    shortDescription: "Grameen parivaron ko pakka ghar",
    benefit: "Pakka ghar banane ke liye ₹1,20,000 tak ki sahayata",
    category: "ghar",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      incomeMax: 200000,
      gender: "all",
      category: "all",
      conditions: ["No pucca house", "BPL family preferred"]
    },
    requiredDocuments: ["aadhaar", "income_certificate", "bpl_certificate"],
    officialApplicationUrl: "https://pmayg.nic.in/",
    officialSourceUrl: "https://pmayg.nic.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana",
    shortDescription: "Muft LPG connection mahilaon ke liye",
    benefit: "Muft LPG connection aur ₹1,600 ki sahayata",
    category: "mahila",
    state: "all",
    eligibilityRules: {
      gender: "female",
      ageMin: 18,
      incomeMax: null,
      category: "sc/st/obc/general",
      conditions: ["Woman of BPL household", "No existing LPG connection"]
    },
    requiredDocuments: ["aadhaar", "bpl_certificate", "bank_account_details"],
    officialApplicationUrl: "https://pmuy.gov.in/",
    officialSourceUrl: "https://pmuy.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-svamitva",
    name: "PM SVAMITVA Yojana",
    shortDescription: "Gramin kshetra ki sampatti ka adhikar",
    benefit: "Property card aur sampatti ka legal adhikar",
    category: "ghar",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      conditions: ["Gramin kshetra mein rehne wale", "Kabja rakhne wale"]
    },
    requiredDocuments: ["aadhaar", "land_records"],
    officialApplicationUrl: "https://svamitva.nic.in/svamitva/",
    officialSourceUrl: "https://svamitva.nic.in/svamitva/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "mgnrega",
    name: "MGNREGA",
    shortDescription: "Rozgar ki guarantee - 100 din ka kaam",
    benefit: "Pratyek varsh 100 din ka samvidhaanik rozgar",
    category: "rojgar",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      incomeMax: null,
      gender: "all",
      conditions: ["Gramin kshetra ka adult resident", "Kaam ki taiyar honi chahiye"]
    },
    requiredDocuments: ["aadhaar", "bank_account_details", "job_card"],
    officialApplicationUrl: "https://nrega.nic.in/",
    officialSourceUrl: "https://nrega.nic.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-jan-dhan",
    name: "Pradhan Mantri Jan Dhan Yojana",
    shortDescription: "Sab ke liye bank account",
    benefit: "Zero balance bank account, ₹2 lakh tak insurance",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 10,
      gender: "all",
      conditions: ["Any Indian citizen without bank account"]
    },
    requiredDocuments: ["aadhaar"],
    officialApplicationUrl: "https://www.pmjjdy.gov.in/",
    officialSourceUrl: "https://www.pmjjdy.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-scholarship",
    name: "PM Scholarship Scheme",
    shortDescription: "Vidyarthion ke liye chhatravritti",
    benefit: "₹2,500-₹3,000 pratyek mahina chhatravritti",
    category: "vidyarthi",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      ageMax: 25,
      gender: "all",
      conditions: ["Minimum 60% marks in previous exam", "Professional degree course mein admission"]
    },
    requiredDocuments: ["aadhaar", "marksheet", "admission_letter", "bank_account_details"],
    officialApplicationUrl: "https://www.scholarships.gov.in/",
    officialSourceUrl: "https://www.scholarships.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat - PMJAY",
    shortDescription: "Muft swasthya bima - ₹5 lakh tak",
    benefit: "Pratyek parivaar ko ₹5 lakh tak ka muft swasthya bima",
    category: "swasthya",
    state: "all",
    eligibilityRules: {
      incomeMax: 500000,
      gender: "all",
      conditions: ["BPL family", "SECC 2011 database mein naam hona chahiye"]
    },
    requiredDocuments: ["aadhaar", "ration_card"],
    officialApplicationUrl: "https://mera.pmjay.gov.in/",
    officialSourceUrl: "https://pmjay.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-mudra",
    name: "PM MUDRA Yojana",
    shortDescription: "Chhote vyavasaya ke liye karz",
    benefit: "₹50,000 tak ka karz bina collateral ke",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      gender: "all",
      conditions: ["Non-corporate small business segment", "Income generating activity"]
    },
    requiredDocuments: ["aadhaar", "business_plan", "bank_account_details"],
    officialApplicationUrl: "https://www.mudra.org.in/",
    officialSourceUrl: "https://www.mudra.org.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "beti-bachao",
    name: "Beti Bachao Beti Padhao",
    shortDescription: "Betiyo ke liye suraksha aur shiksha",
    benefit: "₹1,50,000 tak ki bachat (Sukanya Samriddhi Yojana)",
    category: "mahila",
    state: "all",
    eligibilityRules: {
      gender: "female",
      ageMax: 10,
      conditions: ["Beti ki umra 10 saal se kam honi chahiye", "Account beti ke naam par hona chahiye"]
    },
    requiredDocuments: ["aadhaar", "birth_certificate", "bank_account_details"],
    officialApplicationUrl: "https://www.indiapost.gov.in/banking-services/savings",
    officialSourceUrl: "https://bbpp.nic.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-kisan-maadhan",
    name: "PM Kisan Maandhan Yojana",
    shortDescription: "Kisano ke liye penshon yojana",
    benefit: "60 saal ke baad ₹3,000 pratyek mahina penshon",
    category: "kisan",
    state: "all",
    eligibilityRules: {
      occupation: ["kisan", "kisan_majdoor"],
      ageMin: 18,
      ageMax: 40,
      incomeMax: null,
      gender: "all",
      conditions: ["Small and marginal farmer", "18-40 years old"]
    },
    requiredDocuments: ["aadhaar", "land_records", "bank_account_details"],
    officialApplicationUrl: "https://pmkmy.gov.in/",
    officialSourceUrl: "https://pmkmy.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "atal-pension",
    name: "Atal Pension Yojana",
    shortDescription: "Unorganized kshetra ke liye penshon",
    benefit: "60 saal ke baad ₹1,000-₹5,000 pratyek mahina penshon",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      ageMax: 40,
      gender: "all",
      conditions: ["Unorganized sector worker", "No other pension scheme"]
    },
    requiredDocuments: ["aadhaar", "bank_account_details"],
    officialApplicationUrl: "https://www.npscra.nsdl.co.in/apy.php",
    officialSourceUrl: "https://www.npscra.nsdl.co.in/apy.php",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "swachh-bharat",
    name: "Swachh Bharat Mission - Gramin",
    shortDescription: "Shauchalaya banane mein sahayata",
    benefit: "₹12,000 tak ki sahayata shauchalaya banane ke liye",
    category: "ghar",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      incomeMax: null,
      gender: "all",
      conditions: ["BPL household without toilet facility"]
    },
    requiredDocuments: ["aadhaar", "bpl_certificate"],
    officialApplicationUrl: "https://swachhbharatmission.gov.in/",
    officialSourceUrl: "https://swachhbharatmission.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-rojgar-protsahan",
    name: "PM Rozgar Protsahan Yojana",
    shortDescription: "Naujawanon ke liye rozgar",
    benefit: "EPF ka 12% employer contribution sarkar degi",
    category: "rojgar",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      ageMax: 28,
      gender: "all",
      conditions: ["First time employee", "Salary ₹15,000/month se kam"]
    },
    requiredDocuments: ["aadhaar", "offer_letter", "bank_account_details"],
    officialApplicationUrl: "https://www.epfindia.gov.in/",
    officialSourceUrl: "https://www.epfindia.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "udan",
    name: "UDAN Yojana",
    shortDescription: "Sasti hawai yatra",
    benefit: "Chhote shaharon se ₹2,500 mein hawai yatra",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      gender: "all",
      conditions: ["Travel from/to underserved airports"]
    },
    requiredDocuments: ["aadhaar"],
    officialApplicationUrl: "https://www.civilaviation.gov.in/udan-rcs/udan-rcs",
    officialSourceUrl: "https://www.civilaviation.gov.in/udan-rcs/udan-rcs",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-ayushman-arogya",
    name: "Ayushman Arogya Mandir",
    shortDescription: "Muft ilaj kendra",
    benefit: "₹5 lakh tak ka muft ilaj",
    category: "swasthya",
    state: "all",
    eligibilityRules: {
      incomeMax: 500000,
      gender: "all",
      conditions: ["BPL family", "Not covered under any health insurance"]
    },
    requiredDocuments: ["aadhaar", "income_certificate"],
    officialApplicationUrl: "https://abdm.gov.in/",
    officialSourceUrl: "https://abdm.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "sc-st-pre-matric",
    name: "Pre-Matric Scholarship for SC/ST",
    shortDescription: "SC/ST vidyarthion ke liye chhatravritti",
    benefit: "₹500-₹1,000 pratyek mahina chhatravritti",
    category: "vidyarthi",
    state: "all",
    eligibilityRules: {
      ageMin: 6,
      ageMax: 17,
      gender: "all",
      category: "sc/st",
      conditions: ["Studying in class 9 or 10", "Family income below ₹2 lakh"]
    },
    requiredDocuments: ["aadhaar", "marksheet", "caste_certificate", "income_certificate"],
    officialApplicationUrl: "https://www.scholarships.gov.in/",
    officialSourceUrl: "https://www.scholarships.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana",
    shortDescription: "Beti ke bhavishya ke liye bachat",
    benefit: "8.2% byaaj dar, ₹1,50,000 tak bachat pratyek varsh",
    category: "mahila",
    state: "all",
    eligibilityRules: {
      gender: "female",
      ageMax: 10,
      conditions: ["Beti ki umra 10 saal se kam", "Hindu undivided family"]
    },
    requiredDocuments: ["aadhaar", "birth_certificate", "bank_account_details"],
    officialApplicationUrl: "https://www.indiapost.gov.in/banking-services/savings",
    officialSourceUrl: "https://www.indiapost.gov.in/banking-services/savings",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortDescription: "Fasal ke liye bima suraksha",
    benefit: "Kam premium par fasal ka bima",
    category: "kisan",
    state: "all",
    eligibilityRules: {
      occupation: ["kisan", "kisan_majdoor"],
      ageMin: 18,
      gender: "all",
      conditions: ["Kisan jo fasal ugate hain", "Loan kisan bhi eligible"]
    },
    requiredDocuments: ["aadhaar", "land_records", "bank_account_details", "passbook"],
    officialApplicationUrl: "https://pmfby.gov.in/",
    officialSourceUrl: "https://pmfby.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "digital-india-land",
    name: "Digital India Land Records Modernization",
    shortDescription: "Bhulekh ka digital records",
    benefit: "Online land records access",
    category: "kisan",
    state: "all",
    eligibilityRules: {
      conditions: ["Land owner"]
    },
    requiredDocuments: ["aadhaar", "land_records"],
    officialApplicationUrl: "https://dilrmp.gov.in/",
    officialSourceUrl: "https://dilrmp.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "stand-up-india",
    name: "Stand-Up India",
    shortDescription: "Mahilaon aur SC/ST ke liye karz",
    benefit: "₹10 lakh - ₹1 crore tak ka karz",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      gender: "female",
      category: "sc/st",
      incomeMax: null,
      conditions: ["Woman or SC/ST entrepreneur", "New enterprise"]
    },
    requiredDocuments: ["aadhaar", "business_plan", "caste_certificate", "bank_account_details"],
    officialApplicationUrl: "https://www.standupmitra.in/",
    officialSourceUrl: "https://www.standupmitra.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-gram-sadak",
    name: "Pradhan Mantri Gram Sadak Yojana",
    shortDescription: "Gaon mein sadak nirmaan",
    benefit: "Hr gaon tak pahunchne yogya sadak",
    category: "ghar",
    state: "all",
    eligibilityRules: {
      conditions: ["Rural area with no road connectivity"]
    },
    requiredDocuments: [],
    officialApplicationUrl: "https://pmgsy.nic.in/",
    officialSourceUrl: "https://pmgsy.nic.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "skill-india",
    name: "Skill India Digital Hub",
    shortDescription: "Kaushal vikas aur training",
    benefit: "Muft kaushal training aur praman-patra",
    category: "rojgar",
    state: "all",
    eligibilityRules: {
      ageMin: 15,
      ageMax: 45,
      gender: "all",
      conditions: ["Youth seeking skill development"]
    },
    requiredDocuments: ["aadhaar"],
    officialApplicationUrl: "https://www.skillindiadigital.gov.in/",
    officialSourceUrl: "https://www.skillindiadigital.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "janani-suraksha",
    name: "Janani Suraksha Yojana",
    shortDescription: "Gareeb mahilaon ke liye suvidha",
    benefit: "Hospital mein muft delivery aur ₹1,400 tak cash",
    category: "swasthya",
    state: "all",
    eligibilityRules: {
      gender: "female",
      ageMin: 18,
      ageMax: 49,
      incomeMax: 200000,
      conditions: ["BPL pregnant women", "Age 19+ in some states"]
    },
    requiredDocuments: ["aadhaar", "bpl_certificate", "bank_account_details"],
    officialApplicationUrl: "https://nhm.gov.in/",
    officialSourceUrl: "https://nhm.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "national-scholarship-portal",
    name: "National Scholarship Portal",
    shortDescription: "Vibhinn chhatravrittiyon ka portal",
    benefit: "₹10,000-₹1,00,000 tak ki chhatravritti",
    category: "vidyarthi",
    state: "all",
    eligibilityRules: {
      ageMin: 6,
      ageMax: 30,
      gender: "all",
      incomeMax: 800000,
      conditions: ["Enrolled in recognized institution", "Minimum marks requirement varies"]
    },
    requiredDocuments: ["aadhaar", "marksheet", "income_certificate", "bank_account_details"],
    officialApplicationUrl: "https://www.scholarships.gov.in/",
    officialSourceUrl: "https://www.scholarships.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-jeevan-jyoti",
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    shortDescription: "₹2 lakh ka jeevan bima",
    benefit: "Mrityu par ₹2 lakh ka bima",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      ageMax: 50,
      gender: "all",
      conditions: ["Bank account holder", "₹436 pratyek varsh premium"]
    },
    requiredDocuments: ["aadhaar", "bank_account_details"],
    officialApplicationUrl: "https://www.financialservices.gov.in/pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby",
    officialSourceUrl: "https://www.financialservices.gov.in/pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "pm-suraksha-bima",
    name: "Pradhan Mantri Suraksha Bima Yojana",
    shortDescription: "₹2 lakh ka durlambdha bima",
    benefit: "Durlambdha mrityu ya viklangta par ₹2 lakh",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 18,
      ageMax: 70,
      gender: "all",
      conditions: ["Bank account holder", "₹20 pratyek varsh premium"]
    },
    requiredDocuments: ["aadhaar", "bank_account_details"],
    officialApplicationUrl: "https://www.financialservices.gov.in/pradhan-mantri-suraksha-bima-yojana-pmsby",
    officialSourceUrl: "https://www.financialservices.gov.in/pradhan-mantri-suraksha-bima-yojana-pmsby",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  },
  {
    id: "digi-locker",
    name: "DigiLocker",
    shortDescription: "Digital dastavez storage",
    benefit: "1GB tak cloud storage for documents",
    category: "arthik_madad",
    state: "all",
    eligibilityRules: {
      ageMin: 10,
      conditions: ["Indian citizen with Aadhaar"]
    },
    requiredDocuments: ["aadhaar"],
    officialApplicationUrl: "https://www.digilocker.gov.in/",
    officialSourceUrl: "https://www.digilocker.gov.in/",
    status: "active",
    lastVerified: "2026-09-01",
    lastUpdated: "2026-09-01"
  }
];

module.exports = schemes;
