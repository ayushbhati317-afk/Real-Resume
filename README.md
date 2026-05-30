# ATS Resume Checker

A browser-based ATS resume checker with:

- Formatted resume import for PDF, DOCX, text, HTML, CSV, and images with OCR
- Resume scoring for keyword match, sections, and ATS-friendly formatting
- Automated job description builder
- AI career assistant powered by a private backend API

## Run Locally

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
npm start
```

Open `http://localhost:3000`.

## Deploy on Vercel

Add this environment variable in Vercel:

```text
OPENAI_API_KEY=your_api_key_here
```

The frontend is static and the assistant endpoint runs from `api/assistant.js`.
