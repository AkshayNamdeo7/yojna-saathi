let currentLang = localStorage.getItem('yojna_lang') || 'hi';

const allLangs = [
  { code: 'hi', name: 'हिन्दी', english: 'Hindi' },
  { code: 'en', name: 'English', english: 'English' },
  { code: 'te', name: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', name: 'मराठी', english: 'Marathi' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', english: 'Odia' },
  { code: 'as', name: 'অসমীয়া', english: 'Assamese' },
  { code: 'ur', name: 'اردو', english: 'Urdu' },
  { code: 'sa', name: 'संस्कृतम्', english: 'Sanskrit' },
  { code: 'mai', name: 'मैथिली', english: 'Maithili' },
  { code: 'sd', name: 'سنڌي', english: 'Sindhi' },
  { code: 'ne', name: 'नेपाली', english: 'Nepali' },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali' },
  { code: 'ks', name: 'कॉशुर', english: 'Kashmiri' },
  { code: 'bodo', name: 'बड़ो', english: 'Bodo' }
];

const translations = {
  'hi': {
    tagline: 'आपकी ज़रूरत, आपकी योजना',
    apni_bhasha: 'अपनी भाषा चुनें',
    aapko_kis: 'आपको किस सरकारी मदद की ज़रूरत है?',
    yojna_khojen: 'मेरे लिए योजना खोजें',
    patrata_janchen: 'मेरी पात्रता जाँचें',
    bolkar_poochhen: 'बोलकर पूछें',
    sabhi_yojnayein: 'सभी योजनाएँ देखें',
    kisan: 'किसान', vidyarthi: 'विद्यार्थी', rojgar: 'रोज़गार',
    mahila: 'महिला', swasthya: 'स्वास्थ्य', ghar: 'घर', arthik_madad: 'आर्थिक मदद',
    age: 'उम्र', state: 'राज्य', district: 'ज़िला', gender: 'लिंग',
    male: 'पुरुष', female: 'महिला', occupation: 'व्यवसाय', income: 'वार्षिक आय',
    category: 'श्रेणी', next: 'अगला', back: 'वापस', submit: 'जमा करें',
    upload_doc: 'दस्तावेज़ जोड़ें', processing: 'प्रक्रिया हो रही है...',
    eligible: 'पात्र हो सकते हैं', not_eligible: 'अभी पात्र नहीं हैं',
    aavedan_karein: 'आवेदन करें', dark_mode: 'डार्क मोड', light_mode: 'लाइट मोड',
    required_documents: 'आवश्यक दस्तावेज़', official_link: 'आधिकारिक लिंक',
    last_verified: 'अंतिम सत्यापन', source: 'स्रोत', benefit: 'लाभ',
    kuch_dikkat: 'कुछ दिक्कत आ गई। कृपया दोबारा कोशिश करें।',
    more_info_needed: 'और जानकारी चाहिए',
    evidence_used: 'उपयोग में लाई गई जानकारी',
    missing_info: 'और जानकारी चाहिए:',
    verify_conflict: 'दी गई जानकारी अलग है, कृपया जाँच लें।',
    alternatives: 'वैकल्पिक पात्र योजनाएँ',
    check_this_scheme: 'इस योजना के लिए अपनी पात्रता जाँचें',
    voice_not_supported: 'आपके ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।',
    voice_placeholder: 'उदाहरण: मैं किसान हूँ, मेरी उम्र 45 साल है, मध्य प्रदेश में रहता हूँ',
    no_schemes_found: 'कोई योजना नहीं मिली।',
    schemes_found: 'योजनाएँ मिलीं', search_placeholder: 'योजना खोजें...',
    all_schemes: 'सभी योजनाएँ', home: 'होम',
    disclaimer: 'यह आधिकारिक सरकारी वेबसाइट नहीं है। हम योजनाओं की खोज में मदद करते हैं।',
    fill_details: 'अपनी जानकारी भरें',
    optional_docs: 'दस्तावेज़ जोड़ें (वैकल्पिक)',
    voice_input: 'आवाज़ से भरें', select_language: 'भाषा चुनें',
    years: 'वर्ष', select_state: 'राज्य चुनें', select_occupation: 'व्यवसाय चुनें',
    select_category: 'श्रेणी चुनें', select_income: 'आय चुनें',
    doc_mismatch: 'दस्तावेज़ों में जानकारी अलग है।',
    year_of_birth: 'जन्म वर्ष', you_may_be_eligible: 'आप निम्नलिखित योजनाओं के लिए पात्र हो सकते हैं:',
    eligible_count: 'पात्र योजनाएँ', not_eligible_count: 'अपात्र योजनाएँ',
    total_schemes: 'कुल योजनाएँ', complete_profile: 'प्रोफ़ाइल पूरी करें',
    year: 'साल', apply_now: 'अभी आवेदन करें', view_source: 'स्रोत देखें',
    matches_found: 'मिलान मिला', enter_yr_birth: 'जन्म वर्ष चुनें',
    business: 'व्यवसाय',
    gallery: 'गैलरी से चुनें', camera: 'कैमरे से खींचें',
    processing_msg: 'आपकी जानकारी के आधार पर योजनाएँ खोज रहे हैं...',
    login: 'लॉगिन',
    optional_login: 'लॉगिन वैकल्पिक है',
    login_not_required: 'बिना लॉगिन के भी आप योजनाएँ खोज सकते हैं।',
    mobile_number: 'मोबाइल नंबर',
    continue_otp: 'OTP के साथ जारी रखें',
    close: 'बंद करें',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    guest_mode: 'अतिथि मोड',
    profile_ready: 'आपकी प्रोफ़ाइल तैयार है',
    information_for_search: 'आपकी जानकारी इस खोज के लिए सुरक्षित रूप से इस्तेमाल की जा रही है।',
    demo_otp: 'डेमो मोड: OTP 123456',
    login_success: 'लॉगिन सफल रहा।',
    enter_otp: 'OTP दर्ज करें',
    verify: 'सत्यापित करें',
    invalid_mobile: 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।',
    invalid_otp: 'OTP सही नहीं है। डेमो OTP: 123456।',
    logged_out: 'आप लॉग आउट हो गए हैं।',
last_search: 'अंतिम खोज',
    no_saved_search: 'अभी कोई खोज सहेजी नहीं गई है.',
    voice_title: 'बोलकर पूछें',
    voice_instruction: 'Mic दबाकर अपनी बात बताइए',
    voice_mic: 'माइक',
    voice_ready: 'बोलने के लिए माइक दबाएं',
    voice_listening: 'सुन रहा हूँ…',
    voice_no_speech: 'कुछ सुनाई नहीं दिया। फिर से माइक दबाएं।',
    voice_mic_error: 'सुनने में दिक्कत आई। नीचे लिखकर भेजिए।',
    voice_type_toggle: 'लिखकर बताएं',
    voice_profile_ready: 'आपकी जानकारी जुट चुकी है! "योजनाएँ दिखाएं" दबाएं।',
    income_confirm: 'आपकी सालाना आय {amount} है।',
    income_confirm_approx: 'आपकी सालाना आय लगभग {amount} है।',
    voice_pivot_typed: 'ठीक है, आप नीचे लिखकर भेज सकते हैं।',
    listening: 'सुन रहा हूँ...',
    speaking: 'आप बोलिए...',
    voice_error: 'आवाज़ में दिक्कत आई। फिर से कोशिश कीजिए।',
    voice_unavailable: 'इस ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।',
    type_instead: 'कृपया टाइप करके भेजिए।',
    stop_listening: 'सुनना बंद करें',
    try_again: 'क्षमा कीजिए, मैं समझ नहीं पाया।',
    understood: 'समझ गया!',
    need_more_information: 'नमस्ते! मैं आपके लिए सही योजनाएँ खोजने के लिए कुछ जानकारी चाहूँगा। पहले बताइए:',
    voice_thinking: 'देख रहा हूँ...',
    searching_for_schemes: 'योजनाएँ दिखाएं',
    information_collected: 'आपकी जानकारी जुट गई है!',
    cancel: 'रद्द करें',
    send: 'भेजें',
    microphone_permission: 'कृपया माइक्रोफ़ोन की अनुमति दें।',
    microphone_denied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया टाइप करें।',
    documents: 'दस्तावेज़',
    add_document: 'दस्तावेज़ जोड़ें',
    documents_optional: 'दस्तावेज़ जोड़ना वैकल्पिक है — ये आपकी जानकारी भरने में मदद करते हैं।',
    continue_without_documents: 'बिना दस्तावेज़ जारी रखें',
    choose_document_type: 'दस्तावेज़ का प्रकार चुनें',
    aadhaar_card: 'आधार कार्ड',
    income_certificate: 'आय प्रमाण पत्र',
    caste_certificate: 'जाति प्रमाण पत्र',
    residence_certificate: 'निवास (डोमिसाइल) प्रमाण पत्र',
    disability_certificate: 'दिव्यांगता प्रमाण पत्र',
    student_id: 'छात्र / कॉलेज आईडी',
    land_farmer_document: 'भूमि / किसान दस्तावेज़',
    bank_document: 'बैंक दस्तावेज़',
    ration_card: 'राशन कार्ड',
    other_document: 'अन्य दस्तावेज़',
    take_photo: 'कैमरे से फोटो लें',
    choose_from_gallery: 'गैलरी से चुनें',
    upload_document: 'दस्तावेज़ अपलोड करें',
    change_document: 'दस्तावेज़ बदलें',
    remove_document: 'दस्तावेज़ हटाएँ',
    reading_document: 'दस्तावेज़ पढ़ रहे हैं...',
    extracting_information: 'जानकारी निकाल रहे हैं...',
    checking_information: 'जानकारी जाँच रहे हैं...',
    extracted_information: 'निकाली गई जानकारी',
    please_check_information: 'कृपया निकाली गई जानकारी जाँच लें।',
    information_is_clear: 'जानकारी स्पष्ट मिली',
    information_needs_review: 'जानकारी जाँचने की ज़रूरत है',
    document_mismatch: 'दस्तावेज़ों में जानकारी अलग मिली है।',
    information_difference: 'अलग जानकारी मिली है।',
    please_verify: 'कृपया जाँच लें।',
    document_added: 'दस्तावेज़ जोड़ा गया।',
    document_failed: 'दस्तावेज़ प्रोसेस नहीं हो पाया। कृपया फिर से कोशिश करें।',
    privacy_note: 'आपके दस्तावेज़ों का उपयोग केवल आपकी जानकारी समझने और योजना खोजने में किया जाता है।',
    doc_field_name: 'नाम',
    doc_field_dob: 'जन्म तिथि',
    doc_field_gender: 'लिंग',
    doc_field_state: 'राज्य',
    doc_field_district: 'ज़िला',
    doc_field_address: 'पता',
    doc_field_income: 'वार्षिक आय',
    doc_field_category: 'श्रेणी',
    doc_field_occupation: 'व्यवसाय',
    doc_field_aadhaar: 'आधार नंबर',
    use_document_information: 'इस जानकारी का उपयोग करें',
    back_to_document_types: 'दस्तावेज़ का प्रकार बदलें',
    add_another_document: 'और दस्तावेज़ जोड़ें',
    re_upload: 'फिर से जोड़ें',
    doc_status_processed: 'सफल',
    doc_status_error: 'असफल',
    doc_status_processing: 'प्रक्रिया चल रही है...',
    demo_document_note: 'डेमो मोड में उदाहरण जानकारी दिखाई जा रही है। कृपया इसे अपनी असली जानकारी से बदलें।',
    doc_apply_value: 'दस्तावेज़ वाली बात रखें',
    doc_keep_value: 'अपनी भरी हुई जानकारी रखें',
    doc_applied: 'प्रोफ़ाइल में जानकारी भर दी गई।',
    doc_not_stored: 'सुरक्षा के लिए आधार जैसी संवेदनशील जानकारी डिवाइस पर नहीं सहेजी जाती।',
    official_gov_source: 'आधिकारिक सरकारी स्रोत',
    link_failed: 'आधिकारिक वेबसाइट अभी उपलब्ध नहीं है। कृपया बाद में दोबारा प्रयास करें।',
    try_official_site: 'आधिकारिक वेबसाइट पर जाएँ',
    no_eligible_hint: 'आपके दिए अनुसार कोई भी योजना पूरी तरह पात्र नहीं मिली। ऊपर और-जानकारी-चाहिए या अभी-पात्र-नहीं योजनाओं की जाँच करें, या अपनी प्रोफ़ाइल जानकारी फिर से भरें।',
    eligibility_summary: 'पात्रता सारांश',
    all_eligible_empty: 'अभी कोई भी योजना पात्र नहीं मिली। अपनी जानकारी फिर से जाँच करें या वैकल्पिक योजनाएँ देखें।'
  },
  'en': {
    tagline: 'Your need, your scheme',
    apni_bhasha: 'Choose your language',
    aapko_kis: 'What government help do you need?',
    yojna_khojen: 'Find schemes for me',
    patrata_janchen: 'Check my eligibility',
    bolkar_poochhen: 'Speak to search',
    sabhi_yojnayein: 'View all schemes',
    kisan: 'Farmer', vidyarthi: 'Student', rojgar: 'Employment',
    mahila: 'Women', swasthya: 'Health', ghar: 'Housing', arthik_madad: 'Financial Aid',
    age: 'Age', state: 'State', district: 'District', gender: 'Gender',
    male: 'Male', female: 'Female', occupation: 'Occupation', income: 'Annual Income',
    category: 'Category', next: 'Next', back: 'Back', submit: 'Submit',
    upload_doc: 'Upload Documents', processing: 'Processing...',
    eligible: 'May be eligible', not_eligible: 'Not eligible now',
    aavedan_karein: 'Apply Now', dark_mode: 'Dark Mode', light_mode: 'Light Mode',
    required_documents: 'Required Documents', official_link: 'Official Link',
    last_verified: 'Last Verified', source: 'Source', benefit: 'Benefit',
    kuch_dikkat: 'Something went wrong. Please try again.',
    more_info_needed: 'More information needed',
    evidence_used: 'Information used',
    missing_info: 'Please provide:',
    verify_conflict: 'Provided information differs. Please verify.',
    alternatives: 'Alternative eligible schemes',
    check_this_scheme: 'Check my eligibility for this scheme',
    voice_not_supported: 'Voice input is not supported in your browser.',
    voice_placeholder: 'Example: I am a farmer, 45 years old, living in Madhya Pradesh',
    no_schemes_found: 'No schemes found.',
    schemes_found: 'schemes found', search_placeholder: 'Search schemes...',
    all_schemes: 'All Schemes', home: 'Home',
    disclaimer: 'This is not an official government website. We help discover schemes.',
    fill_details: 'Fill your details',
    optional_docs: 'Add documents (optional)',
    voice_input: 'Speak to fill', select_language: 'Select Language',
    years: 'years', select_state: 'Select State', select_occupation: 'Select Occupation',
    select_category: 'Select Category', select_income: 'Select Income',
    doc_mismatch: 'Information in documents is different.',
    year_of_birth: 'Year of Birth', you_may_be_eligible: 'You may be eligible for these schemes:',
    eligible_count: 'Eligible', not_eligible_count: 'Not eligible',
    total_schemes: 'Total schemes', complete_profile: 'Complete Profile',
    year: 'year', apply_now: 'Apply Now', view_source: 'View Source',
    matches_found: 'matches found', enter_yr_birth: 'Select year of birth',
    business: 'Business',
    gallery: 'Choose from gallery', camera: 'Take a photo',
    processing_msg: 'Finding schemes based on your information...',
    login: 'Login',
    optional_login: 'Login is optional',
    login_not_required: 'You can search schemes without logging in.',
    mobile_number: 'Mobile Number',
    continue_otp: 'Continue with OTP',
    close: 'Close',
    profile: 'Profile',
    logout: 'Logout',
    guest_mode: 'Guest mode',
    profile_ready: 'Your profile is ready',
    information_for_search: 'Your information is being used securely for this search.',
    demo_otp: 'Demo mode: OTP 123456',
    login_success: 'Login successful.',
    enter_otp: 'Enter OTP',
    verify: 'Verify',
    invalid_mobile: 'Please enter a valid 10-digit mobile number.',
    invalid_otp: 'Incorrect OTP. Demo OTP: 123456.',
    logged_out: 'You have been logged out.',
    last_search: 'Last search',
    no_saved_search: 'No saved searches yet.',
    voice_title: 'Speak to search',
    voice_instruction: 'Press the mic and tell me your details',
    voice_mic: 'Mic',
    voice_ready: 'Tap the mic to speak',
    voice_listening: 'Listening…',
    voice_no_speech: "Didn't catch that. Tap the mic again.",
    voice_mic_error: 'Mic problem. Type below instead.',
    voice_type_toggle: 'Type instead',
    voice_profile_ready: 'Your details are ready! Tap "Show schemes".',
    income_confirm: 'Your annual income is {amount}.',
    income_confirm_approx: 'Your annual income is about {amount}.',
    voice_pivot_typed: 'Ok, you can type your answer below instead.',
    listening: 'Listening...',
    speaking: 'Please speak...',
    voice_error: 'Voice input had a problem. Please try again.',
    voice_unavailable: 'Voice input is not available in this browser.',
    type_instead: 'Please type and send instead.',
    stop_listening: 'Stop listening',
    try_again: 'Sorry, I did not understand that.',
    understood: 'Got it!',
    need_more_information: 'Hello! I need a little information to find the right schemes for you. First, tell me:',
    voice_thinking: 'Let me check...',
    searching_for_schemes: 'Show schemes',
    information_collected: 'Your information has been collected!',
    cancel: 'Cancel',
    send: 'Send',
    microphone_permission: 'Please allow microphone access.',
    microphone_denied: 'Microphone access was denied. Please type instead.',
    documents: 'Documents',
    add_document: 'Add document',
    documents_optional: 'Adding documents is optional — they help fill your information.',
    continue_without_documents: 'Continue without documents',
    choose_document_type: 'Choose document type',
    aadhaar_card: 'Aadhaar Card',
    income_certificate: 'Income Certificate',
    caste_certificate: 'Caste Certificate',
    residence_certificate: 'Residence (Domicile) Certificate',
    disability_certificate: 'Disability Certificate',
    student_id: 'Student / College ID',
    land_farmer_document: 'Land / Farmer Document',
    bank_document: 'Bank Document',
    ration_card: 'Ration Card',
    other_document: 'Other Document',
    take_photo: 'Take a photo',
    choose_from_gallery: 'Choose from gallery',
    upload_document: 'Upload document',
    change_document: 'Change document',
    remove_document: 'Remove document',
    reading_document: 'Reading document...',
    extracting_information: 'Extracting information...',
    checking_information: 'Checking information...',
    extracted_information: 'Extracted information',
    please_check_information: 'Please check the extracted information.',
    information_is_clear: 'Information is clear',
    information_needs_review: 'Information needs review',
    document_mismatch: 'Information in documents is different.',
    information_difference: 'Information is different.',
    please_verify: 'Please verify.',
    document_added: 'Document added.',
    document_failed: 'Document could not be processed. Please try again.',
    privacy_note: 'Your documents are used only to understand your information and find schemes.',
    doc_field_name: 'Name',
    doc_field_dob: 'Date of Birth',
    doc_field_gender: 'Gender',
    doc_field_state: 'State',
    doc_field_district: 'District',
    doc_field_address: 'Address',
    doc_field_income: 'Annual Income',
    doc_field_category: 'Category',
    doc_field_occupation: 'Occupation',
    doc_field_aadhaar: 'Aadhaar Number',
    use_document_information: 'Use this information',
    back_to_document_types: 'Change document type',
    add_another_document: 'Add another document',
    re_upload: 'Re-upload',
    doc_status_processed: 'Success',
    doc_status_error: 'Failed',
    doc_status_processing: 'Processing...',
    demo_document_note: 'Demo mode is showing example information. Please replace it with your real information.',
    doc_apply_value: 'Use the document value',
    doc_keep_value: 'Keep my entered value',
    doc_applied: 'Information filled into your profile.',
    doc_not_stored: 'For security, sensitive information like Aadhaar is not saved on this device.',
    official_gov_source: 'Official Government Source',
    link_failed: 'The official website is currently unavailable. Please try again later.',
    try_official_site: 'Visit official website',
    no_eligible_hint: 'No fully eligible scheme was found for the information you provided. Check the "More information needed" or "Not eligible now" schemes above, or update your profile details.',
    eligibility_summary: 'Eligibility summary',
    all_eligible_empty: 'No schemes are eligible right now. Re-check your details or explore alternative schemes.'
  },
  'te': {
    tagline: 'మీ అవసరం, మీ పథకం',
    apni_bhasha: 'మీ భాష ఎంచుకోండి',
    aapko_kis: 'మీకు ఏ ప్రభుత్వ సహాయం అవసరం?',
    yojna_khojen: 'నా కోసం పథకాలు కనుగొనండి',
    patrata_janchen: 'నా అర్హత తనిఖీ చేయండి',
    bolkar_poochhen: 'మాట్లాడి అడగండి',
    sabhi_yojnayein: 'అన్ని పథకాలు చూడండి',
    kisan: 'రైతు', vidyarthi: 'విద్యార్థి', rojgar: 'ఉపాధి',
    mahila: 'మహిళ', swasthya: 'ఆరోగ్యం', ghar: 'ఇల్లు', arthik_madad: 'ఆర్థిక సహాయం',
    eligible: 'అర్హత ఉండవచ్చు', not_eligible: 'ఇప్పుడు అర్హత లేదు',
    aavedan_karein: 'దరఖాస్తు చేయండి',
    kuch_dikkat: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    voice_not_supported: 'మీ బ్రౌజర్‌లో వాయిస్ సదుపాయం అందుబాటులో లేదు.',
    no_schemes_found: 'పథకాలు కనుగొనబడలేదు.',
    search_placeholder: 'పథకాలు శోధించండి...',
    all_schemes: 'అన్ని పథకాలు', disclaimer: 'ఇది అధికారిక ప్రభుత్వ వెబ్‌సైట్ కాదు.',
    fill_details: 'మీ వివరాలు నమోదు చేయండి',
    year_of_birth: 'పుట్టిన సంవత్సరం', processing_msg: 'మీ సమాచారం ఆధారంగా పథకాలు కనుగొంటున్నాము...',
    you_may_be_eligible: 'మీరు ఈ పథకాలకు అర్హులు కావచ్చు:', eligible_count: 'అర్హులు',
    not_eligible_count: 'అర్హులు కారు', apply_now: 'దరఖాస్తు చేయండి', view_source: 'మూలం చూడండి',
    enter_yr_birth: 'పుట్టిన సంవత్సరం ఎంచుకోండి', voice_input: 'వాయిస్ తో నమోదు చేయండి'
  },
  'mr': {
    tagline: 'तुमची गरज, तुमची योजना',
    apni_bhasha: 'तुमची भाषा निवडा',
    aapko_kis: 'तुम्हाला कोणत्या सरकारी मदतीची गरज आहे?',
    yojna_khojen: 'माझ्यासाठी योजना शोधा',
    eligible: 'पात्र असू शकतात', not_eligible: 'आता पात्र नाहीत',
    aavedan_karein: 'अर्ज करा',
    kuch_dikkat: 'काही अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    no_schemes_found: 'योजना सापडल्या नाहीत.',
    search_placeholder: 'योजना शोधा...', all_schemes: 'सर्व योजना',
    disclaimer: 'ही अधिकृत सरकारी वेबसाइट नाही.',
    fill_details: 'तुमची माहिती भरा', year_of_birth: 'जन्म वर्ष',
    processing_msg: 'तुमच्या माहितीनुसार योजना शोधत आहोत...',
    you_may_be_eligible: 'तुम्ही या योजनांसाठी पात्र असू शकता:', eligible_count: 'पात्र',
    not_eligible_count: 'अपात्र', apply_now: 'अर्ज करा', view_source: 'स्रोत पहा',
    enter_yr_birth: 'जन्म वर्ष निवडा', voice_input: 'आवाजाने भरा',
    kisan: 'शेतकरी', vidyarthi: 'विद्यार्थी', rojgar: 'रोजगार',
    mahila: 'महिला', swasthya: 'आरोग्य', ghar: 'घर', arthik_madad: 'आर्थिक मदत'
  },
  'ta': {
    tagline: 'உங்கள் தேவை, உங்கள் திட்டம்',
    apni_bhasha: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    eligible: 'தகுதி பெறலாம்', not_eligible: 'இப்போது தகுதி இல்லை',
    aavedan_karein: 'விண்ணப்பிக்கவும்',
    kuch_dikkat: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
    no_schemes_found: 'திட்டங்கள் எதுவும் கிடைக்கவில்லை.',
    search_placeholder: 'திட்டங்களைத் தேடுங்கள்...', all_schemes: 'அனைத்து திட்டங்கள்',
    disclaimer: 'இது அதிகாரப்பூர்வ அரசு வலைதளம் அல்ல.',
    fill_details: 'உங்கள் விவரங்களை நிரப்பவும்', year_of_birth: 'பிறந்த ஆண்டு',
    processing_msg: 'உங்கள் தகவலின் அடிப்படையில் திட்டங்களைத் தேடுகிறோம்...',
    you_may_be_eligible: 'இந்த திட்டங்களுக்கு நீங்கள் தகுதி பெறலாம்:', eligible_count: 'தகுதி',
    not_eligible_count: 'தகுதி இல்லை', apply_now: 'விண்ணப்பிக்கவும்', view_source: 'மூலம் பார்க்க',
    enter_yr_birth: 'பிறந்த ஆண்டைத் தேர்ந்தெடுக்கவும்', voice_input: 'குரலில் நிரப்பவும்',
    kisan: 'விவசாயி', vidyarthi: 'மாணவர்', rojgar: 'வேலைவாய்ப்பு',
    mahila: 'பெண்', swasthya: 'சுகாதாரம்', ghar: 'வீடு', arthik_madad: 'நிதி உதவி'
  },
  'bn': {
    tagline: 'আপনার প্রয়োজন, আপনার প্রকল্প',
    eligible: 'যোগ্য হতে পারেন', not_eligible: 'এখন যোগ্য নন',
    aavedan_karein: 'আবেদন করুন',
    kuch_dikkat: 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    no_schemes_found: 'কোনো প্রকল্প পাওয়া যায়নি।',
    search_placeholder: 'প্রকল্প খুঁজুন...', all_schemes: 'সব প্রকল্প',
    disclaimer: 'এটি সরকারি ওয়েবসাইট নয়।',
    fill_details: 'আপনার তথ্য পূরণ করুন', year_of_birth: 'জন্মসাল',
    processing_msg: 'আপনার তথ্যের ভিত্তিতে প্রকল্প খুঁজছি...',
    you_may_be_eligible: 'আপনি এই প্রকল্পের জন্য যোগ্য হতে পারেন:', eligible_count: 'যোগ্য',
    not_eligible_count: 'অযোগ্য', apply_now: 'আবেদন করুন', view_source: 'উৎস দেখুন',
    enter_yr_birth: 'জন্মসাল বেছে নিন', voice_input: 'কণ্ঠে পূরণ করুন',
    kisan: 'কৃষক', vidyarthi: 'ছাত্র', rojgar: 'কর্মসংস্থান',
    mahila: 'নারী', swasthya: 'স্বাস্থ্য', ghar: 'বাড়ি', arthik_madad: 'আর্থিক সাহায্য'
  },
  'gu': {
    tagline: 'તમારી જરૂરિયાત, તમારી યોજના',
    eligible: 'પાત્ર હોઈ શકો છો', not_eligible: 'હાલ પાત્ર નથી',
    aavedan_karein: 'અરજી કરો',
    kuch_dikkat: 'કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.',
    no_schemes_found: 'કોઈ યોજના મળી નથી.',
    search_placeholder: 'યોજનાઓ શોધો...', all_schemes: 'બધી યોજનાઓ',
    disclaimer: 'આ સત્તાવાર સરકારી વેબસાઇટ નથી.',
    fill_details: 'તમારી માહિતી ભરો', year_of_birth: 'જન્મ વર્ષ',
    processing_msg: 'તમારી માહિતી આધારે યોજનાઓ શોધી રહ્યા છીએ...',
    you_may_be_eligible: 'તમે આ યોજનાઓ માટે પાત્ર હોઈ શકો છો:', eligible_count: 'પાત્ર',
    not_eligible_count: 'અપાત્ર', apply_now: 'અરજી કરો', view_source: 'સ્ત્રોત જુઓ',
    enter_yr_birth: 'જન્મ વર્ષ પસંદ કરો', voice_input: 'અવાજથી ભરો',
    kisan: 'ખેડૂત', vidyarthi: 'વિદ્યાર્થી', rojgar: 'રોજગાર',
    mahila: 'મહિલા', swasthya: 'આરોગ્ય', ghar: 'ઘર', arthik_madad: 'આર્થિક મદદ'
  },
  'kn': {
    tagline: 'ನಿಮ್ಮ ಅಗತ್ಯ, ನಿಮ್ಮ ಯೋಜನೆ',
    eligible: 'ಅರ್ಹರಾಗಬಹುದು', not_eligible: 'ಈಗ ಅರ್ಹರಲ್ಲ',
    aavedan_karein: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    kuch_dikkat: 'ಏನೋ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    no_schemes_found: 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಸಿಗಲಿಲ್ಲ.',
    search_placeholder: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ...', all_schemes: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
    disclaimer: 'ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್ ಅಲ್ಲ.',
    fill_details: 'ನಿಮ್ಮ ಮಾಹಿತಿ ತುಂಬಿಸಿ', year_of_birth: 'ಹುಟ್ಟಿದ ವರ್ಷ',
    processing_msg: 'ನಿಮ್ಮ ಮಾಹಿತಿ ಆಧಾರದ ಮೇಲೆ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇವೆ...',
    you_may_be_eligible: 'ನೀವು ಈ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರಾಗಬಹುದು:', eligible_count: 'ಅರ್ಹರು',
    not_eligible_count: 'ಅರ್ಹರಲ್ಲ', apply_now: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ', view_source: 'ಮೂಲ ನೋಡಿ',
    enter_yr_birth: 'ಹುಟ್ಟಿದ ವರ್ಷ ಆಯ್ಕೆಮಾಡಿ', voice_input: 'ಧ್ವನಿಯಿಂದ ತುಂಬಿಸಿ',
    kisan: 'ರೈತ', vidyarthi: 'ವಿದ್ಯಾರ್ಥಿ', rojgar: 'ಉದ್ಯೋಗ',
    mahila: 'ಮಹಿಳೆ', swasthya: 'ಆರೋಗ್ಯ', ghar: 'ಮನೆ', arthik_madad: 'ಆರ್ಥಿಕ ಸಹಾಯ'
  },
  'ml': {
    tagline: 'നിങ്ങളുടെ ആവശ്യം, നിങ്ങളുടെ പദ്ധതി',
    eligible: 'യോഗ്യരാകാം', not_eligible: 'ഇപ്പോൾ യോഗ്യരല്ല',
    aavedan_karein: 'അപേക്ഷിക്കുക',
    kuch_dikkat: 'എന്തോ തകരാറുണ്ട്. വീണ്ടും ശ്രമിക്കുക.',
    no_schemes_found: 'പദ്ധതികൾ കണ്ടെത്തിയില്ല.',
    search_placeholder: 'പദ്ധതികൾ തിരയുക...', all_schemes: 'എല്ലാ പദ്ധതികളും',
    disclaimer: 'ഇത് ഔദ്യോഗിക സർക്കാർ വെബ്സൈറ്റ് അല്ല.',
    fill_details: 'നിങ്ങളുടെ വിവരങ്ങൾ പൂരിപ്പിക്കുക', year_of_birth: 'ജനിച്ച വർഷം',
    processing_msg: 'നിങ്ങളുടെ വിവരത്തിന്റെ അടിസ്ഥാനത്തിൽ പദ്ധതികൾ കണ്ടെത്തുന്നു...',
    you_may_be_eligible: 'നിങ്ങൾക്ക് ഈ പദ്ധതികൾക്ക് യോഗ്യത ലഭിക്കാം:', eligible_count: 'യോഗ്യർ',
    not_eligible_count: 'യോഗ്യരല്ല', apply_now: 'അപേക്ഷിക്കുക', view_source: 'ഉറവിടം കാണുക',
    enter_yr_birth: 'ജനിച്ച വർഷം തിരഞ്ഞെടുക്കുക', voice_input: 'ശബ്ദത്തിൽ പൂരിപ്പിക്കുക',
    kisan: 'കർഷകൻ', vidyarthi: 'വിദ്യാർത്ഥി', rojgar: 'തൊഴിൽ',
    mahila: 'വനിത', swasthya: 'ആരോഗ്യം', ghar: 'വീട്', arthik_madad: 'സാമ്പത്തിക സഹായം'
  },
  'pa': {
    tagline: 'ਤੁਹਾਡੀ ਲੋੜ, ਤੁਹਾਡੀ ਯੋਜਨਾ',
    eligible: 'ਪਾਤਰ ਹੋ ਸਕਦੇ ਹਾਂ', not_eligible: 'ਹੁਣ ਪਾਤਰ ਨਹੀਂ ਹਾਂ',
    aavedan_karein: 'ਅਰਜ਼ੀ ਕਰੋ',
    kuch_dikkat: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    no_schemes_found: 'ਕੋਈ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ।',
    search_placeholder: 'ਯੋਜਨਾਵਾਂ ਖੋਜੋ...', all_schemes: 'ਸਾਰੀਆਂ ਯੋਜਨਾਵਾਂ',
    disclaimer: 'ਇਹ ਸਰਕਾਰੀ ਵੈਬਸਾਈਟ ਨਹੀਂ ਹੈ।',
    fill_details: 'ਆਪਣੀ ਜਾਣਕਾਰੀ ਭਰੋ', year_of_birth: 'ਜਨਮ ਸਾਲ',
    processing_msg: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ ਤੇ ਯੋਜਨਾਵਾਂ ਲੱਭ ਰਹੇ ਹਾਂ...',
    you_may_be_eligible: 'ਤੁਸੀਂ ਇਹਨਾਂ ਯੋਜਨਾਵਾਂ ਲਈ ਪਾਤਰ ਹੋ ਸਕਦੇ ਹੋ:', eligible_count: 'ਪਾਤਰ',
    not_eligible_count: 'ਅਪਾਤਰ', apply_now: 'ਅਰਜ਼ੀ ਕਰੋ', view_source: 'ਸਰੋਤ ਵੇਖੋ',
    enter_yr_birth: 'ਜਨਮ ਸਾਲ ਚੁਣੋ', voice_input: 'ਅਵਾਜ਼ ਨਾਲ ਭਰੋ',
    kisan: 'ਕਿਸਾਨ', vidyarthi: 'ਵਿਦਿਆਰਥੀ', rojgar: 'ਰੁਜ਼ਗਾਰ',
    mahila: 'ਔਰਤ', swasthya: 'ਸਿਹਤ', ghar: 'ਘਰ', arthik_madad: 'ਆਰਥਿਕ ਮਦਦ'
  },
  'or': {
    tagline: 'ଆପଣଙ୍କ ଆବଶ୍ୟକତା, ଆପଣଙ୍କ ଯୋଜନା',
    eligible: 'ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି', not_eligible: 'ଏବେ ଯୋଗ୍ୟ ନୁହଁନ୍ତି',
    aavedan_karein: 'ଆବେଦନ କରନ୍ତୁ',
    kuch_dikkat: 'କିଛି ସମସ୍ୟା ହୋଇଛି। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    no_schemes_found: 'କୌଣସି ଯୋଜନା ମିଳିଲା ନାହିଁ।',
    search_placeholder: 'ଯୋଜନା ଖୋଜନ୍ତୁ...', all_schemes: 'ସବୁ ଯୋଜନା',
    disclaimer: 'ଏହା ସରକାରୀ ୱେବସାଇଟ୍ ନୁହେଁ।',
    fill_details: 'ଆପଣଙ୍କ ତଥ୍ୟ ପୂରଣ କରନ୍ତୁ', year_of_birth: 'ଜନ୍ମ ବର୍ଷ',
    processing_msg: 'ଆପଣଙ୍କ ତଥ୍ୟ ଆଧାରରେ ଯୋଜନା ଖୋଜୁଛୁ...',
    you_may_be_eligible: 'ଆପଣ ଏହି ଯୋଜନା ପାଇଁ ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି:', eligible_count: 'ଯୋଗ୍ୟ',
    not_eligible_count: 'ଅଯୋଗ୍ୟ', apply_now: 'ଆବେଦନ କରନ୍ତୁ', view_source: 'ଉତ୍ସ ଦେଖନ୍ତୁ',
    enter_yr_birth: 'ଜନ୍ମ ବର୍ଷ ବାଛନ୍ତୁ', voice_input: 'ସ୍ୱରରେ ପୂରଣ କରନ୍ତୁ',
    kisan: 'ଚାଷୀ', vidyarthi: 'ଛାତ୍ର', rojgar: 'ରୋଜଗାର',
    mahila: 'ମହିଳା', swasthya: 'ସ୍ୱାସ୍ଥ୍ୟ', ghar: 'ଘର', arthik_madad: 'ଆର୍ଥିକ ସାହାଯ୍ୟ'
  },
  'as': {
    tagline: 'আপোনাৰ প্ৰয়োজন, আপোনাৰ আঁচনি',
    eligible: "যোগ্য হ'ব পাৰে", not_eligible: 'এতিয়া যোগ্য নহয়',
    aavedan_karein: 'আবেদন কৰক',
    kuch_dikkat: 'কিবা সমস্যা হৈছে। পুনৰ চেষ্টা কৰক।',
    no_schemes_found: "কোনো আঁচনি পোৱা নগ'ল।",
    search_placeholder: 'আঁচনি বিচাৰক...', all_schemes: 'সকলো আঁচনি',
    disclaimer: 'এইটো চৰকাৰী ৱেবছাইট নহয়।',
    fill_details: 'আপোনাৰ তথ্য পূৰণ কৰক', year_of_birth: 'জন্ম বছৰ',
    processing_msg: 'আপোনাৰ তথ্যৰ ভিত্তিত আঁচনি বিচাৰি আছো...',
    you_may_be_eligible: "আপুনি এই আঁচনিসমূহৰ বাবে যোগ্য হ'ব পাৰে:", eligible_count: 'যোগ্য',
    not_eligible_count: 'অযোগ্য', apply_now: 'আবেদন কৰক', view_source: 'উৎস চাওক',
    enter_yr_birth: 'জন্ম বছৰ বাছনি কৰক', voice_input: 'কণ্ঠে পূৰণ কৰক',
    kisan: 'কৃষক', vidyarthi: 'ছাত্ৰ', rojgar: 'চাকৰি',
    mahila: 'মহিলা', swasthya: 'স্বাস্থ্য', ghar: 'ঘৰ', arthik_madad: 'আৰ্থিক সহায়'
  },
  'ur': {
    tagline: 'آپ کی ضرورت، آپ کی یوجنا',
    eligible: 'اہل ہو سکتے ہیں', not_eligible: 'ابھی اہل نہیں ہیں',
    aavedan_karein: 'درخواست دیں',
    kuch_dikkat: 'کچھ دکت آ گئی۔ دوبارہ کوشش کریں۔',
    no_schemes_found: 'کوئی یوجنا نہیں ملی۔',
    search_placeholder: 'یوجنا تلاش کریں...', all_schemes: 'تمام یوجنا',
    disclaimer: 'یہ سرکاری ویب سائٹ نہیں ہے۔',
    fill_details: 'اپنی معلومات بھریں', year_of_birth: 'سال پیدائش',
    processing_msg: 'آپ کی معلومات کی بنیاد پر یوجنا تلاش کر رہے ہیں...',
    you_may_be_eligible: 'آپ ان یوجنا کے لیے اہل ہو سکتے ہیں:', eligible_count: 'اہل',
    not_eligible_count: 'غیر اہل', apply_now: 'درخواست دیں', view_source: 'ذریعہ دیکھیں',
    enter_yr_birth: 'سال پیدائش چنیں', voice_input: 'آواز سے بھریں',
    kisan: 'کسان', vidyarthi: 'طالب علم', rojgar: 'روزگار',
    mahila: 'خاتون', swasthya: 'صحت', ghar: 'گھر', arthik_madad: 'مالی مدد'
  }
};

// Generic fallback for languages without full translations
function t(key) {
  const lang = translations[currentLang];
  if (lang && lang[key]) return lang[key];
  if (translations['en'] && translations['en'][key]) return translations['en'][key];
  return key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated && translated !== key) {
      el.textContent = translated;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated && translated !== key) {
      el.placeholder = translated;
    }
  });
  if (typeof updateVoiceHeaderButton === 'function') updateVoiceHeaderButton();
  if (typeof updateDocUI === 'function') updateDocUI();
  document.documentElement.lang = currentLang;
}

function setLanguage(code) {
  currentLang = code;
  localStorage.setItem('yojna_lang', code);
  applyTranslations();
  updateOccupationOptions();
  if (typeof renderLoginState === 'function') renderLoginState();
  loadServerTranslations(code).then(() => {
    applyTranslations();
    updateOccupationOptions();
    if (typeof renderLoginState === 'function') renderLoginState();
  });
}

async function loadServerTranslations(code) {
  try {
    const res = await fetch(`/api/translations/${encodeURIComponent(code)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && typeof data === 'object' && Object.keys(data).length) {
      translations[code] = { ...(translations[code] || {}), ...data };
    }
  } catch (e) {
    // keep offline dictionary fallback
  }
}

function updateOccupationOptions() {
  const sel = document.getElementById('profileOccupation');
  if (!sel) return;
  const val = sel.value;
  const opts = [
    ['', '—'],
    ['kisan', t('kisan')],
    ['student', t('vidyarthi')],
    ['naukri', t('rojgar')],
    ['vyavasaya', t('business')],
    ['mazdoor', 'Mazdoor'],
    ['retired', 'Retired'],
    ['other', 'Anya']
  ];
  sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  sel.value = val;
}

function buildLanguageGrids() {
  const grids = [
    document.getElementById('languageGrid'),
    document.getElementById('modalLangGrid')
  ];
  grids.forEach(grid => {
    if (!grid) return;
    grid.innerHTML = allLangs.map(l => `
      <button class="lang-card ${l.code === currentLang ? 'selected' : ''}"
              onclick="selectLanguage('${l.code}')" tabindex="0">
        <span class="lang-native">${l.name}</span>
        <span class="lang-english">${l.english}</span>
      </button>
    `).join('');
  });
}

function selectLanguage(code) {
  setLanguage(code);
  buildLanguageGrids();
  const langScreen = document.getElementById('screen-language');
  if (langScreen && langScreen.classList.contains('active')) {
    showScreen('screen-home');
  }
  if (typeof closeLangModal === 'function') {
    closeLangModal();
  } else {
    const modal = document.getElementById('langModal');
    if (modal) modal.style.display = 'none';
  }
}
