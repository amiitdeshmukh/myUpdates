# Dev Edge Coach (Next.js)

A personal app for developers who do not want to fall behind.

It does 3 things:
- Sends only top high-signal recent tech/AI updates (summary + reference links).
- Builds what you should learn next with practical tasks and questions.
- Sends scheduled digest emails (twice daily).

It also includes:
- A structured AI/LLM/RAG from-scratch workflow (phase-by-phase with deliverables).
- An in-app phase quiz (MCQ) with 15 questions including coding-focused questions.
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
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for cloud progress tracking)
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
- Two runs per day via `/api/reminder`: `03:00 UTC` and `15:00 UTC`.

Set `CRON_SECRET` in Vercel env and it will be checked in `Authorization: Bearer <CRON_SECRET>` (or `x-cron-secret`).

## 5) Free Real Progress Tracker (Supabase)
Use Supabase free tier.

1. Create a free Supabase project.
2. In Supabase SQL Editor, run [schema.sql](/Users/amiitdeshmukh/VSCode/myUpdates/supabase/schema.sql).
3. In Supabase Auth settings, enable Email login (magic link).
4. Add your deployed Vercel URL to Supabase Auth redirect URLs.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars.
6. Redeploy.

After login in quiz tab, your phase scores sync to DB and persist across devices.

## 6) CI/CD (GitHub Actions + Vercel)
This repo includes:
- [ci.yml](/Users/amiitdeshmukh/VSCode/myUpdates/.github/workflows/ci.yml): runs `npm ci`, `npm run lint`, `npm run build` on PRs and `main`.
- [deploy-vercel.yml](/Users/amiitdeshmukh/VSCode/myUpdates/.github/workflows/deploy-vercel.yml): deploys to Vercel on `main`.

Set these GitHub repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

How to get Vercel values:
1. Install and login once locally: `npm i -g vercel && vercel login`
2. In repo root, run: `vercel link`
3. Open `.vercel/project.json` and copy:
   - `orgId` -> `VERCEL_ORG_ID`
   - `projectId` -> `VERCEL_PROJECT_ID`
4. Create token in Vercel Account Settings -> Tokens -> use as `VERCEL_TOKEN`.

## Notes
- If no LLM key is set, the app still works with deterministic fallback tasks/questions.
- RSS sources are in `lib/updates.ts`; you can add/remove feeds based on your interests.
- Reminder email now contains digest updates only (summaries + source links).
- Quiz progress uses Supabase cloud sync when logged in, and local storage fallback when not logged in.
