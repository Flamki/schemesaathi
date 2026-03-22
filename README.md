# SchemeSaathi
AI-powered welfare scheme discovery for India, built for **Changemaker League: AI for Good Hackathon 2026**.

## What It Does
SchemeSaathi helps citizens find eligible government schemes in minutes using:
- Profile-based eligibility filtering
- AI-personalized reasons and next actions
- Document checklist and apply steps
- In-app Q&A assistant (English + Hindi)

## Stack
- React 18 + Vite
- Vercel (static frontend + serverless API)
- Gemini API (server-side key via Vercel env)

## Local Setup
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```

## Environment Variables
Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set:
- `GEMINI_API_KEY` (required for AI mode)
- `GEMINI_MODEL` (optional, default: `gemini-2.0-flash`)

## Vercel Deployment
1. Push repo to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel Project Settings:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)
4. Deploy.

The app will:
- Serve frontend as static Vite build.
- Handle Gemini requests through `/api/gemini` (server-side key).

## Notes For Hackathon Demo
- If server-side Gemini is unavailable, eligibility logic still works with deterministic fallback.
- You can optionally set a personal Gemini key from the UI for local testing.
- Keep real API keys out of source control.

## Security
If any API key was shared publicly, rotate it immediately in Google AI Studio and update Vercel env vars.
