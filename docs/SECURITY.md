# Security — ads-insight-app

## Secret Handling
- `OPENAI_API_KEY` stored in Vercel environment variables — never referenced in any client-side file
- Supabase `service_role` key used only in server-side API routes; `anon` key only in browser client
- File uploads go server → Supabase Storage; signed URLs issued per-request, not stored permanently

## Permission Model (v1 — open demo)
- All tables have permissive RLS (read + write open to anonymous users)
- No sensitive user data stored in v1 (no PII, no payment info)
- Replaced in Lock-Down sprint with `auth.uid() = user_id` row-level policies

## Approved Tools Rule
- Agent may only call the four named tools: `generate_insight`, `compute_metrics`, `answer_question`, `tag_anomalies`
- No `run_any`, `exec`, or raw SQL from AI layer
- Every tool call writes a row to `audit_logs` before returning

## Audit Principle
- Every meaningful state change (upload, generate, ask, delete) is logged with `action`, `object_id`, `user_id`, `metadata`, and `created_at`
- Logs are append-only; no log row is ever deleted or updated

## Lock-Down Sprint (before real user data)
- Enable Supabase Auth
- Replace v1 RLS policies with owner-scoped policies
- Migrate demo rows under a system user_id
- Add CSRF protection and rate limiting on upload + AI routes
