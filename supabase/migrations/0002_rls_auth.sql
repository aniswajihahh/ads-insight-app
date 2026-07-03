-- Sprint 4: Replace open v1 RLS policies with auth-based policies.
-- Demo datasets (is_demo = true) remain readable by everyone.
-- User-owned rows are readable/writable only by their owner (auth.uid() = user_id).
-- Apply this in the Supabase SQL Editor before or immediately after deploying Sprint 4 code.

-- ── datasets ────────────────────────────────────────────────────────────────
drop policy if exists "datasets_v1_read"  on datasets;
drop policy if exists "datasets_v1_write" on datasets;

create policy "datasets_v2_read" on datasets
  for select using (is_demo = true or auth.uid() = user_id);

create policy "datasets_v2_insert" on datasets
  for insert with check (auth.uid() = user_id);

create policy "datasets_v2_update" on datasets
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "datasets_v2_delete" on datasets
  for delete using (auth.uid() = user_id);

-- ── insights ─────────────────────────────────────────────────────────────────
drop policy if exists "insights_v1_read"  on insights;
drop policy if exists "insights_v1_write" on insights;

create policy "insights_v2_read" on insights
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from datasets d
      where d.id = insights.dataset_id and d.is_demo = true
    )
  );

create policy "insights_v2_insert" on insights
  for insert with check (auth.uid() = user_id);

create policy "insights_v2_update" on insights
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "insights_v2_delete" on insights
  for delete using (auth.uid() = user_id);

-- ── metrics ──────────────────────────────────────────────────────────────────
drop policy if exists "metrics_v1_read"  on metrics;
drop policy if exists "metrics_v1_write" on metrics;

create policy "metrics_v2_read" on metrics
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from datasets d
      where d.id = metrics.dataset_id and d.is_demo = true
    )
  );

create policy "metrics_v2_insert" on metrics
  for insert with check (auth.uid() = user_id);

create policy "metrics_v2_update" on metrics
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "metrics_v2_delete" on metrics
  for delete using (auth.uid() = user_id);

-- ── questions ────────────────────────────────────────────────────────────────
drop policy if exists "questions_v1_read"  on questions;
drop policy if exists "questions_v1_write" on questions;

create policy "questions_v2_read" on questions
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from datasets d
      where d.id = questions.dataset_id and d.is_demo = true
    )
  );

create policy "questions_v2_insert" on questions
  for insert with check (auth.uid() = user_id);

create policy "questions_v2_update" on questions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "questions_v2_delete" on questions
  for delete using (auth.uid() = user_id);

-- ── audit_logs ───────────────────────────────────────────────────────────────
-- Inserts come from server-side routes via the service-role (admin) client,
-- which bypasses RLS entirely. Keep insert open so routes using the anon
-- client can still write. Reads are restricted to the row owner.
drop policy if exists "audit_logs_v1_read"  on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;

create policy "audit_logs_v2_insert" on audit_logs
  for insert with check (true);

create policy "audit_logs_v2_read" on audit_logs
  for select using (auth.uid() = user_id);
