create table if not exists datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text,
  row_count integer,
  column_names jsonb,
  file_url text,
  file_type text,
  is_demo boolean default false,
  share_token text unique default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);

alter table datasets enable row level security;
drop policy if exists "datasets_v1_read" on datasets;
create policy "datasets_v1_read" on datasets for select using (true);
drop policy if exists "datasets_v1_write" on datasets;
create policy "datasets_v1_write" on datasets for all using (true) with check (true);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  dataset_id uuid references datasets(id) on delete cascade,
  summary text,
  summary_source text default 'openai/gpt-4o',
  summary_confidence numeric default 0.85,
  summary_review_status text default 'unreviewed',
  key_trends jsonb,
  key_trends_source text default 'openai/gpt-4o',
  key_trends_confidence numeric default 0.82,
  key_trends_review_status text default 'unreviewed',
  anomalies jsonb,
  anomalies_source text default 'openai/gpt-4o',
  anomalies_confidence numeric default 0.78,
  anomalies_review_status text default 'unreviewed',
  version integer default 1,
  created_at timestamptz not null default now()
);

alter table insights enable row level security;
drop policy if exists "insights_v1_read" on insights;
create policy "insights_v1_read" on insights for select using (true);
drop policy if exists "insights_v1_write" on insights;
create policy "insights_v1_write" on insights for all using (true) with check (true);

create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  dataset_id uuid references datasets(id) on delete cascade,
  column_name text not null,
  metric_type text not null,
  metric_value numeric,
  metric_label text,
  metric_label_source text default 'rule-based',
  metric_label_confidence numeric default 0.95,
  metric_label_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table metrics enable row level security;
drop policy if exists "metrics_v1_read" on metrics;
create policy "metrics_v1_read" on metrics for select using (true);
drop policy if exists "metrics_v1_write" on metrics;
create policy "metrics_v1_write" on metrics for all using (true) with check (true);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  dataset_id uuid references datasets(id) on delete cascade,
  question_text text not null,
  answer_text text,
  answer_source text default 'openai/gpt-4o',
  answer_confidence numeric default 0.80,
  answer_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table questions enable row level security;
drop policy if exists "questions_v1_read" on questions;
create policy "questions_v1_read" on questions for select using (true);
drop policy if exists "questions_v1_write" on questions;
create policy "questions_v1_write" on questions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into datasets (id, name, description, row_count, column_names, file_type, is_demo) values
  ('a1000000-0000-0000-0000-000000000001', 'E-Commerce Monthly Sales', 'Monthly revenue, orders, and return rate for an online store (Jan–Dec 2023)', 12, '["month","revenue","orders","avg_order_value","return_rate"]', 'csv', true),
  ('a1000000-0000-0000-0000-000000000002', 'Marketing Campaign Performance', 'CTR, impressions, conversions and cost per click across 5 ad campaigns', 5, '["campaign","impressions","clicks","ctr","conversions","cpc","spend"]', 'csv', true),
  ('a1000000-0000-0000-0000-000000000003', 'Student Exam Results', 'Scores across 6 subjects for 30 students in a semester', 30, '["student_id","math","english","science","history","art","avg_score"]', 'csv', true);

insert into insights (dataset_id, summary, key_trends, anomalies, version) values
  ('a1000000-0000-0000-0000-000000000001',
   'Revenue grew steadily through Q3, peaking in October at $84k, then dipped sharply in November. Average order value increased 18% year-over-year while return rates stayed below 5% for 10 of 12 months.',
   '[{"trend":"Revenue peak in October ($84k)","direction":"up"},{"trend":"Return rate spike in November (8.2%)","direction":"down"},{"trend":"Avg order value up 18% vs prior year","direction":"up"}]',
   '[{"column":"return_rate","month":"November","value":0.082,"note":"Highest return rate of the year — possible post-promotion effect"}]',
   1),
  ('a1000000-0000-0000-0000-000000000002',
   'Campaign C delivered the highest conversion rate (4.8%) at the lowest cost per click ($0.32). Campaign A had the most impressions but the weakest CTR (0.9%), suggesting a targeting or creative issue.',
   '[{"trend":"Campaign C best ROI","direction":"up"},{"trend":"Campaign A high spend, low CTR","direction":"down"},{"trend":"Overall avg CPC dropped 12% vs benchmark","direction":"up"}]',
   '[{"column":"ctr","campaign":"Campaign A","value":0.009,"note":"CTR below 1% on highest-spend campaign — review audience targeting"}]',
   1),
  ('a1000000-0000-0000-0000-000000000003',
   'Class average across all subjects is 71.4%. Math scores show the widest spread (42–98), indicating mixed ability levels. Art has the highest average (81.2%) and the tightest score distribution.',
   '[{"trend":"Art highest class average (81.2)","direction":"up"},{"trend":"Math widest score range (56 pts)","direction":"neutral"},{"trend":"3 students below 50 avg — at risk","direction":"down"}]',
   '[{"column":"math","note":"6 students scored below 50 in Math — outlier cluster worth addressing"}]',
   1);

insert into metrics (dataset_id, column_name, metric_type, metric_value, metric_label) values
  ('a1000000-0000-0000-0000-000000000001', 'revenue', 'max', 84000, 'Peak revenue: $84,000 (October)'),
  ('a1000000-0000-0000-0000-000000000001', 'revenue', 'avg', 61250, 'Monthly avg revenue: $61,250'),
  ('a1000000-0000-0000-0000-000000000002', 'ctr', 'max', 0.048, 'Best CTR: 4.8% (Campaign C)'),
  ('a1000000-0000-0000-0000-000000000002', 'spend', 'sum', 18400, 'Total ad spend: $18,400'),
  ('a1000000-0000-0000-0000-000000000003', 'avg_score', 'avg', 71.4, 'Class average score: 71.4'),
  ('a1000000-0000-0000-0000-000000000003', 'avg_score', 'min', 44.2, 'Lowest student average: 44.2');

insert into questions (dataset_id, question_text, answer_text) values
  ('a1000000-0000-0000-0000-000000000001', 'Why did revenue drop in November?', 'November saw a 22% revenue dip from October''s peak. The simultaneous spike in return rate (8.2%) suggests a post-promotion effect — customers returning items bought during an October sale. This is common after discount campaigns and likely not a structural decline.'),
  ('a1000000-0000-0000-0000-000000000002', 'Which campaign should I cut?', 'Campaign A is the strongest cut candidate: it consumed the largest share of budget but delivered a 0.9% CTR — the lowest in the set. Reallocating its budget to Campaign C (4.8% CTR, $0.32 CPC) could improve overall ROI significantly.');