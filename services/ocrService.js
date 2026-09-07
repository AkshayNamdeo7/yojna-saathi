const {
  DOCUMENT_TYPES,
  DEMO_FIELDS_BY_TYPE,
  ALL_PROFILE_FIELDS,
  normalizeDocumentType
} = require('../data/documentTypes');

const MESSAGES = {
  hi: {
    demo: 'डेमो मोड में उदाहरण जानकारी दिखाई जा रही है। कृपया इसे अपनी असली जानकारी से मिलाएँ।',
    unavailable: 'OCR सेवा अभी उपलब्ध नहीं है। डेमो मोड में उदाहरण जानकारी दिखाई जा रही है।',
    processed: 'दस्तावेज़ सफलतापूर्वक पढ़ लिया गया।'
  },
  en: {
    demo: 'Demo mode is showing example information. Please match it with your real information.',
    unavailable: 'OCR service is unavailable. Showing example information in demo mode.',
    processed: 'Document processed successfully.'
  }
};

function emptyFields() {
  const fields = {};
  ALL_PROFILE_FIELDS.forEach(f => { fields[f] = null; });
  return fields;
}

function demoExtract(documentType) {
  const type = normalizeDocumentType(documentType);
  const base = emptyFields();
  Object.assign(base, DEMO_FIELDS_BY_TYPE[type] || {});
  const mapped = {};
  const perField = {};
  Object.keys(base).forEach(k => {
    if (base[k] !== null && base[k] !== undefined) {
      mapped[k] = base[k];
    }
    perField[k] = { value: base[k], confidence: 0 };
  });
  return { type, mapped, perField, confidence: 0 };
}

function mapOcrResponse(src, type) {
  const fields = emptyFields();
  const allowed = DOCUMENT_TYPES.find(d => d.id === type);
  const keys = allowed ? allowed.profileFields : ALL_PROFILE_FIELDS;
  keys.forEach(k => {
    const v = src[k];
    if (v !== null && v !== undefined && v !== '') fields[k] = v;
  });
  if (!fields.name && src.name) fields.name = src.name;
  const mapped = {};
  Object.keys(fields).forEach(k => { if (fields[k] !== null && fields[k] !== undefined) mapped[k] = fields[k]; });
  return mapped;
}

async function processDocument(file, documentType) {
  if (!file) throw new Error('No file provided');
  const type = normalizeDocumentType(documentType);

  if (!process.env.OCR_API_KEY || process.env.DEMO_MODE === 'true') {
    const { type: normType, mapped, perField, confidence } = demoExtract(type);
    return {
      success: true,
      type: normType,
      documentType: normType,
      fields: mapped,
      extractedFields: mapped,
      fieldConfidence: perField,
      confidence,
      confidenceReadable: 'needs_review',
      demo: true,
      message: MESSAGES.en.demo
    };
  }

  try {
    const endpoint = process.env.OCR_ENDPOINT || process.env.OCR_URL;
    if (!endpoint) throw new Error('no_ocr_endpoint');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Authorization': 'Bearer ' + process.env.OCR_API_KEY,
        'X-Document-Type': type
      },
      body: file.buffer,
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error('ocr_http_' + res.status);
    const data = await res.json();
    const src = (data && (data.fields || data.extractedFields)) || {};
    const fields = mapOcrResponse(src, type);
    const confidence = data.confidence !== undefined && data.confidence !== null ? Number(data.confidence) : 0;
    return {
      success: true,
      type,
      documentType: type,
      fields,
      extractedFields: fields,
      fieldConfidence: (data.fieldConfidence && typeof data.fieldConfidence === 'object') ? data.fieldConfidence : {},
      confidence,
      confidenceReadable: confidence >= 0.7 ? 'clear' : 'needs_review',
      demo: false,
      message: MESSAGES.en.processed
    };
  } catch (err) {
    const { type: normType, mapped, perField, confidence } = demoExtract(type);
    return {
      success: true,
      type: normType,
      documentType: normType,
      fields: mapped,
      extractedFields: mapped,
      fieldConfidence: perField,
      confidence,
      confidenceReadable: 'needs_review',
      demo: true,
      message: MESSAGES.en.unavailable
    };
  }
}

module.exports = { processDocument, normalizeDocumentType, demoExtract };