const path = require('path');

async function processDocument(file) {
  if (!process.env.OCR_API_KEY || process.env.DEMO_MODE === 'true') {
    const ext = path.extname(file.originalname).toLowerCase();
    return {
      type: ext === '.pdf' ? 'document' : 'image',
      extractedFields: {
        name: null,
        dob: null,
        gender: null,
        address: null,
        aadhaar: null,
        income: null,
        category: null
      },
      confidence: 0,
      demo: true,
      message: 'Demo mode mein document processing simulate ki ja rahi hai. Kripya manually jankari bharen.'
    };
  }

  return {
    type: 'processed',
    extractedFields: {
      name: null,
      dob: null,
      gender: null,
      address: null,
      aadhaar: null,
      income: null,
      category: null
    },
    confidence: 0,
    demo: false,
    message: 'Document processed.'
  };
}

module.exports = { processDocument };
