# Architecture — ads-insight-app

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API routes (upload, parse, AI calls)
- **Database:** Supabase (Postgres + Storage for file uploads)
- **AI:** OpenAI GPT-4o via server-side API route (key never in browser)
- **Deploy:** Vercel

## What to Build Now vs Later
| Now (v1) | Later |
|---|---|
| File upload + AI summary | User accounts + data isolation |
| Metric cards + Q&A | Chart visualizations |
| Demo datasets, no login | PDF export, shareable links |
| Rule-based metric detection | API source connections |

## Key User Action — Step by Step
1. **Capture:** User drops a CSV on the upload page
2. **Parse:** API route reads file, extracts column names + row count + sample rows
3. **Store:** `datasets` row created in Supabase; file saved to Supabase Storage
4. **Analyze:** Server sends column schema + sample rows to OpenAI; response stored in `insights` and `metrics` tables
5. **Show:** Dataset detail page renders summary card, metric highlights, trend list
6. **Question:** User types a question → API sends dataset context + question to OpenAI → answer stored in `questions` → streamed to UI
7. **Audit:** Every upload and AI call appended to `audit_logs`

## Why the Core Runs Without AI
Column parsing, row counts, min/max/avg metrics, and data display are all computed rule-based. The app shows real structured data even if the OpenAI call fails — AI fields fall back to "Analysis pending" with a retry button.
