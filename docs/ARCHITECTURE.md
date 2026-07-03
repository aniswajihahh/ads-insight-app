# Architecture — Ads Insight App

## Stack
- **Frontend**: Next.js 14 (App Router) on Vercel
- **Database**: Supabase (Postgres + Storage for file uploads)
- **AI**: OpenAI GPT-4o via server-side API route (key never exposed to client)
- **File Parsing**: `papaparse` (CSV) + `xlsx` (Excel) — server-side only

## Build Sequence
**Now:** File upload → parse → store → AI insight generation → display results → follow-up Q&A
**Next:** User accounts, saved datasets, insight history
**Later:** API data connectors, scheduled re-analysis, team sharing

## Key User Action — Step by Step
1. User drops a CSV on the upload page
2. Next.js API route receives file, parses columns + rows server-side
3. Parsed schema + sample rows stored in `datasets` table; file stored in Supabase Storage
4. Server calls OpenAI with column names + data sample → returns JSON insight
5. Insight (summary, trends, confidence) stored in `insights` table
6. Results page fetches and renders insight in plain language
7. User types a question → API route sends question + dataset context to OpenAI → answer stored in `answers` table and displayed

## Layer Plan
1. **Data layer first**: tables, storage bucket, RLS (open for demo)
2. **App logic**: upload handler, parser, CRUD for datasets/insights/questions/answers
3. **Smart layer on top**: OpenAI calls for summary, trends, Q&A

## Core Without AI
If OpenAI is disabled: file uploads, parses, stores, and displays raw column stats (row count, column names, numeric min/max). The data pipeline runs independently; AI enriches it.
