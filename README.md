# 📄 Resume Scorer

An AI-powered resume screening tool. Upload a resume, describe the job, and get an instant score out of 10 — powered by Claude AI.

---

## Project Structure

```
resume-scorer/
├── backend/                  # Express API server
│   ├── config/
│   │   └── systemPrompt.js   # Claude system prompt
│   ├── routes/
│   │   └── analyze.js        # POST /api/analyze route
│   ├── services/
│   │   └── claudeService.js  # Claude API integration
│   ├── server.js             # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                 # React (Vite) app
    ├── src/
    │   ├── components/
    │   │   ├── UploadZone.jsx # Drag-and-drop file upload
    │   │   └── ScoreCard.jsx  # Result display
    │   ├── hooks/
    │   │   └── useResumeAnalyzer.js  # All state + logic
    │   ├── utils/
    │   │   └── api.js         # Fetch wrapper for backend
    │   ├── App.jsx            # Root component
    │   └── main.jsx           # React entry point
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm install
npm run dev         # Runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # Runs on http://localhost:5173
```

---

## API

### `POST /api/analyze`

**Form Data:**

| Field       | Type   | Description               |
|-------------|--------|---------------------------|
| `file`      | File   | Resume (PDF or TXT)       |
| `jobPrompt` | String | Job requirement text      |

**Response:**

```json
{
  "score": 7.5,
  "verdict": "Recommended",
  "summary": "...",
  "strengths": ["...", "..."],
  "gaps": ["..."],
  "skillBreakdown": {
    "technicalSkills": 8,
    "experience": 7,
    "education": 6,
    "projectRelevance": 8
  },
  "recommendation": "..."
}
```

---

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18, Vite                |
| Backend  | Node.js, Express, Multer      |
| AI       | Anthropic Claude (Sonnet)     |
