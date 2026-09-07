# Yojna Saathi

**"Aapki zaroorat, aapki yojna."**

An AI-powered website that helps Indian citizens discover government schemes they may be eligible for, based on basic information and optionally uploaded documents.

## Features

- **Language-first entry** — Choose from 20 major Indian languages (Hindi, English, Telugu, Marathi, Tamil, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and more)
- **Simple basic info form** — Age, gender, state, occupation, income, category
- **Document upload** — Upload Aadhaar, income certificate, caste certificate, etc. (OCR service interface prepared; demo mode simulates processing)
- **Voice input** — "Bolkar poochhen" button using the Browser Web Speech API
- **Structured eligibility engine** — Deterministic rules, NOT free-form LLM reasoning
- **~30 verified demo schemes** — Across categories: Kisan, Vidyarthi, Rojgar, Mahila, Swasthya, Ghar, Arthik Madad
- **Results with no dead-end** — Always shows eligible schemes after non-eligible ones
- **All Schemes page** — Searchable/browsable list
- **Dark mode** — Toggleable, persisted
- **Scheme Sync Engine** — Modular service architecture ready for real government APIs/feeds (demo/mock mode now)
- **Demo mode** — Works fully without external AI/OCR APIs

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL-ready (via clean service/repository layer)
- **AI/OCR**: Clean service interfaces with env-var based configuration

## Project Structure

```
yojna-saathi/
├── server.js                  # Express entry point
├── package.json
├── .env.example
├── .gitignore
├── data/
│   ├── schemes.js             # Demo scheme dataset (replace/expand later)
│   └── translations.js        # Server-side translation dictionary (20 languages)
├── services/
│   ├── eligibilityEngine.js   # Structured deterministic eligibility rules
│   ├── aiService.js           # AI service interface (voice parsing)
│   ├── ocrService.js          # OCR service interface
│   └── schemeSyncEngine.js    # Scheme sync engine (discover/extract/normalize/validate)
└── public/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── app.js             # Main app logic
        └── i18n.js            # Client-side translations (20 languages)
```

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure environment variables
cp .env.example .env

# 3. Start the server
npm start
```

Then open http://localhost:3000

## Environment Variables

All variables are optional. The app runs in **demo mode** by default.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `AI_API_KEY` | AI service API key (not required for demo) | empty |
| `AI_API_URL` | AI service URL (not required for demo) | empty |
| `OCR_API_KEY` | OCR API key (not required for demo) | empty |
| `OCR_API_URL` | OCR API URL (not required for demo) | empty |
| `DEMO_MODE` | Use mock data/services | `true` |

## Demo Mode

The app works fully in demo mode. Judges can experience:
1. Language → 2. Basic profile → 3. Document upload simulation → 4. Eligibility calculation → 5. Scheme results → 6. Official application links

## Deployment (Vercel compatible)

This project is Vercel-ready. The Express app lives in `app.js` and is wrapped for Vercel by `api/index.js` (a serverless handler) with `vercel.json` routing all requests to it. Local `npm start` uses `server.js`.

```
vercel
```

The app runs in demo mode automatically (no API keys needed) because `ocrService` falls back to demo whenever `OCR_API_KEY` is unset — `DEMO_MODE=true` only forces it locally. Optional env vars can be set in the Vercel dashboard: `OCR_API_KEY`, `AI_API_KEY`, `DEMO_MODE`.

## Important Notes

- **Yojna Saathi is NOT an official government website.** It helps citizens discover schemes.
- Final eligibility and application are determined by the concerned government department.
- Application links point to official government URLs.
- Demo scheme data is for demonstration. Real data would come via the Scheme Sync Engine from official government sources.
