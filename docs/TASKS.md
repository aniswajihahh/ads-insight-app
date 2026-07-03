# Tasks & Sprints — Ads Insight App

## Sprint 1 — Database + File Upload Engine (Days 1–2)
**Goal:** Schema live, file upload works, parsed data stored. Core engine running.
- [ ] Run migration SQL (datasets, insights, questions, answers, audit_logs tables + RLS)
- [ ] Seed 2 demo datasets with pre-generated insights (visible without login)
- [ ] Create Supabase Storage bucket `datasets`
- [ ] Build `/api/upload` route: receive file, parse CSV/Excel server-side, store structured data
- [ ] Display upload page with drag-and-drop (no login required)
- [ ] Show demo dataset on homepage without auth

**Definition of Done:** Upload a real CSV → row appears in `datasets` table → columns + sample rows stored correctly.

---

## Sprint 2 — AI Insight Generation (Days 2–3) ✅ v1 functional milestone
**Goal:** Upload → instant plain-English insight. Core workflow end-to-end.
- [ ] Build `/api/generate-insight` route: call OpenAI with structured sample, store result in `insights`
- [ ] Trigger insight generation automatically after successful upload
- [ ] Results page `/dataset/[id]`: show summary + ranked trends
- [ ] Handle loading state (processing spinner) + error state (failed generation message)
- [ ] Write audit log entry per generation
- [ ] Test with 3 real CSV files (sales, traffic, student grades)

**Definition of Done:** Upload CSV → results page shows plain-English summary + ≥3 trends within 30 seconds.

---

## Sprint 3 — Follow-up Q&A (Days 3–4)
**Goal:** Users can ask questions about their dataset and get answers.
- [ ] Q&A input form on results page
- [ ] Build `/api/ask` route: receive question + dataset_id, call OpenAI with context, store in `questions` + `answers`
- [ ] Display answer below question; show answer history for dataset
- [ ] Handle empty question / no answer gracefully
- [ ] Write audit log per answer

**Definition of Done:** Type "Which region performed best?" → answer appears within 15 seconds, stored in DB, visible on refresh.

---

## Sprint 4 — Polish + Demo Case Study (Days 4–5)
**Goal:** App is shareable, looks real, has a demo story.
- [ ] Datasets list page `/datasets` — shows all uploaded + demo datasets
- [ ] Delete dataset button (with confirmation modal — high-risk action)
- [ ] Empty state screens (no datasets yet, no questions yet)
- [ ] Error boundary for failed uploads/parsing
- [ ] Write one-page case study (marketing data example: before/after time comparison)
- [ ] Deploy to Vercel, test end-to-end in production

**Definition of Done:** Shareable link works, demo datasets render, upload-to-insight flow works in prod.

---

## Sprint 5 — Lock It Down (Week 2)
**Goal:** Add auth, isolate user data, make it safe for real data.
- [ ] Add Supabase Auth (email/password + magic link)
- [ ] Login / signup pages; redirect after auth
- [ ] Replace open RLS policies with `auth.uid() = user_id` on all tables
- [ ] Associate uploads with logged-in `user_id`
- [ ] Protect `/api/*` routes: reject unauthenticated requests
- [ ] Keep demo datasets readable by all (set `user_id = null` with separate public policy)

**Definition of Done:** Logged-out user sees only demo data; logged-in user sees only their own uploads + demo data.

---

## Gantt (Text)
```
Day 1-2  | Sprint 1 — DB + Upload Engine
Day 2-3  | Sprint 2 — AI Insight Generation  ← v1 functional
Day 3-4  | Sprint 3 — Follow-up Q&A
Day 4-5  | Sprint 4 — Polish + Case Study + Deploy
Week 2   | Sprint 5 — Lock It Down (Auth + RLS)
```
