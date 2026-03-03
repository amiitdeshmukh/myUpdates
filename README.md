# Dev Edge Coach (Next.js)

A personal app for developers who do not want to fall behind.

It does 3 things:
- Sends only top high-signal recent tech/AI updates (summary + reference links).
- Builds what you should learn next with practical tasks and questions.
- Sends a daily reminder email asking if you completed today's task.

It also includes:
- A structured AI/LLM/RAG from-scratch workflow (phase-by-phase with deliverables).
- An in-app phase quiz (MCQ) with hard locking. Next phase unlocks only after passing current phase.
- Exact prompts per phase that you can copy into online AI tutors.

## Stack
- Next.js (App Router, TypeScript)
- RSS feeds for fresh updates
- Gemini or OpenAI (optional, for better summaries + personalized learning plan)
- SMTP via Nodemailer for email reminders

## 1) Setup
```bash
npm install
cp .env.example .env
```

Fill `.env`:
- `LLM_PROVIDER=gemini` (or `openai`)
- For Gemini: `GEMINI_API_KEY` and optional `GEMINI_MODEL`
- For OpenAI: `OPENAI_API_KEY` and optional `OPENAI_MODEL`
- `EMAIL_FROM`, `EMAIL_TO`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `CRON_SECRET` (required for secure scheduled reminders)
- `TOP_UPDATES` (default `2`)
- `DEV_PROFILE` (your profile to personalize learning tasks)

## 2) Run locally
```bash
npm run dev
```

Open `http://localhost:3000`.

## 3) API routes
- `GET /api/digest`
  - Returns top updates + learning tasks + questions.
- `POST /api/reminder`
  - Sends reminder email now.
- `GET /api/reminder`
  - Intended for scheduled cron execution.

## 4) Daily scheduling (Vercel)
`vercel.json` includes:
- Daily run at `03:00 UTC` via `/api/reminder`.

Set `CRON_SECRET` in Vercel env and it will be checked in `Authorization: Bearer <CRON_SECRET>` (or `x-cron-secret`).

## Notes
- If no LLM key is set, the app still works with deterministic fallback tasks/questions.
- RSS sources are in `lib/updates.ts`; you can add/remove feeds based on your interests.
