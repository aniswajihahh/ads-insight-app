# Tasks — ads-insight-app

## Gantt Overview
```
Week 1: Sprint 1 (DB + Upload Engine)
Week 1: Sprint 2 (Q&A + Metrics)        ← v1 functional ✅
Week 2: Sprint 3 (Polish + Export)
Week 2: Sprint 4 (Lock It Down)
```

---

## Sprint 1 — DB + Upload Engine
**Goal:** Database live, file upload works, AI insight generated and displayed. App viewable without login.

- [ ] Run migration SQL in Supabase (datasets, insights, metrics, questions, audit_logs)
- [ ] Verify seeded demo rows render on homepage (dataset cards with summaries)
- [ ] Build `/upload` page: drag-and-drop CSV/Excel input (react-dropzone)
- [ ] POST `/api/upload`: parse file (papaparse / xlsx), extract columns + row count, save to `datasets`
- [ ] POST `/api/generate-insight`: send column schema + sample rows to OpenAI, store result in `insights`
- [ ] Auto-trigger insight generation after successful upload
- [ ] Render insight summary card and key trends list on `/dataset/[id]`
- [ ] Loading spinner during AI call; error state with retry if OpenAI fails
- [ ] Log every upload + insight-generate event to `audit_logs`

**Definition of Done:** Upload a real CSV → insight card appears with summary and trends. Demo datasets visible on homepage with no login.

---

## Sprint 2 — Q&A + Metric Highlights ✅ v1 functional
**Goal:** Users can ask questions and see metric cards. Full success scenario is usable end-to-end.

- [ ] POST `/api/ask`: receive question + dataset_id, build prompt with dataset context, call OpenAI, store in `questions`, stream answer to UI
- [ ] Question input + answer display on `/dataset/[id]` — shows Q&A history for session
- [ ] Compute top-5 metrics per dataset (max, min, avg for numeric columns) — store in `metrics`
- [ ] Metric highlight cards rendered on dataset page (e.g. "Peak revenue: $84k — October")
- [ ] Dataset list page `/datasets` showing all uploaded + demo datasets with name, row count, summary preview
- [ ] Create (already done via upload), edit name/description, delete dataset — all wired to DB
- [ ] Empty state for datasets page ("Upload your first dataset")
- [ ] Error state if question submitted with no dataset context
- [ ] Manual test: upload CSV → see summary → see metrics → ask question → get answer

**Definition of Done:** End-to-end success scenario works. No dead buttons. Data persists on reload.

---

## Sprint 3 — Polish + Shareable Output
**Goal:** Insight output is exportable and shareable; charts added for numeric columns.

- [ ] PDF export of insight page (Puppeteer route or react-pdf)
- [ ] Public share link using `share_token` — read-only `/share/[token]` page, no auth needed
- [ ] Auto-generate bar or line chart for numeric columns (Recharts)
- [ ] "Regenerate insight" button — calls AI again, increments `version`, keeps old row
- [ ] Copy-to-clipboard button on summary card and individual trend items
- [ ] Improve AI prompt: include detected anomalies and metric outliers for richer output
- [ ] Show `review_status` badge on insights with confidence < 0.7 ("Low confidence — review")

**Definition of Done:** Share link opens insight read-only in incognito. PDF downloads with summary + metrics. Chart renders for numeric columns.

---

## Sprint 4 — Lock It Down
**Goal:** Auth added, user data isolated, open RLS replaced with owner policies.

- [ ] Enable Supabase Auth (email + magic link)
- [ ] Add `/login` and `/signup` pages
- [ ] Set `user_id` on all rows created post-login
- [ ] Replace v1 open RLS policies with `auth.uid() = user_id` on all tables
- [ ] Demo datasets remain public (is_demo = true bypass policy)
- [ ] Redirect unauthenticated upload attempts to login with return URL
- [ ] Rate-limit `/api/upload` and `/api/generate-insight` (10 req/min per IP)
- [ ] Verify no API key or service_role key appears in browser network tab

**Definition of Done:** Logged-out user can view demo datasets but cannot upload or ask questions. Logged-in user only sees their own uploaded datasets. All secrets absent from browser.
