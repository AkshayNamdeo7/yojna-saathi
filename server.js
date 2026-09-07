require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

const schemes = require('./data/schemes');
const { i18n } = require('./data/translations');
const { checkEligibility } = require('./services/eligibilityEngine');
const { processDocument } = require('./services/ocrService');
const { processVoice } = require('./services/aiService');

app.get('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const data = i18n[lang] || i18n['en'] || {};
  res.json(data);
});

app.get('/api/schemes', (req, res) => {
  let results = schemes.filter(s => s.status === 'active');
  const { category, state, search } = req.query;
  if (category) results = results.filter(s => s.category === category);
  if (state) results = results.filter(s => s.state === 'all' || s.state === state);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q)
    );
  }
  res.json(results);
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = schemes.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json(scheme);
});

app.post('/api/eligibility', (req, res) => {
  const profile = req.body;
  const results = checkEligibility(profile, schemes);
  res.json(results);
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const extracted = await processDocument(req.file);
    res.json(extracted);
  } catch (err) {
    res.status(500).json({ error: 'Document processing unavailable', fallback: true });
  }
});

app.post('/api/voice', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  try {
    const profile = await processVoice(text);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Voice processing unavailable', fallback: true });
  }
});

app.get('/api/categories', (req, res) => {
  const cats = [...new Set(schemes.filter(s => s.status === 'active').map(s => s.category))];
  res.json(cats);
});

app.get('/api/states', (req, res) => {
  const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
    'Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu','Delhi',
    'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
  ];
  res.json(states);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Yeh seva uplabdh nahi hai. Kripya dobara koshish karein.' });
  }
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Kuch dikkat aa gayi. Kripya dobara koshish karein.' });
});

app.listen(PORT, () => {
  console.log(`Yojna Saathi running on http://localhost:${PORT}`);
});
