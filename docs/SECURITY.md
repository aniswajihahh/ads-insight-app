# Security — Ads Insight App

## Secret Handling
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` live in Vercel environment variables only
- Never referenced in client-side code or exposed in API responses
- All AI calls made from Next.js API routes (`/api/*`) — client sends dataset ID, not raw data

## Permission Model (v1 — demo open)
- Supabase RLS enabled on all tables with permissive v1 policies (open read + write)
- No user sessions yet; `user_id` is nullable — demo rows have `user_id = null`
- Lock-down sprint: replace open policies with `auth.uid() = user_id`; add Supabase Auth

## Approved Tools Rule
- Agent may only call named, scoped tools: `openai_chat_completion`, `supabase_db_write`, `supabase_storage_upload`
- No `eval`, `exec`, `run_any`, or dynamic tool construction permitted
- File parsing runs server-side only; raw file bytes never forwarded to AI — only structured sample rows

## Audit Principle
- Every AI generation (insight, answer) writes a record to `audit_logs` before returning to the client
- Failed generations log error + partial context for debugging
- No meaningful action is silent
