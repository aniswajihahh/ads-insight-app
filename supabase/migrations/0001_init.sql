create table if not exists datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  row_count integer,
  column_names jsonb,
  sample_rows jsonb,
  storage_path text,
  status text default 'ready',
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
  summary_source text default 'openai-gpt4o',
  summary_confidence numeric default 0.75,
  summary_review_status text default 'unreviewed',
  trends jsonb,
  trends_source text default 'openai-gpt4o',
  trends_confidence numeric default 0.75,
  trends_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table insights enable row level security;
drop policy if exists "insights_v1_read" on insights;
create policy "insights_v1_read" on insights for select using (true);
drop policy if exists "insights_v1_write" on insights;
create policy "insights_v1_write" on insights for all using (true) with check (true);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  dataset_id uuid references datasets(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table questions enable row level security;
drop policy if exists "questions_v1_read" on questions;
create policy "questions_v1_read" on questions for select using (true);
drop policy if exists "questions_v1_write" on questions;
create policy "questions_v1_write" on questions for all using (true) with check (true);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  question_id uuid references questions(id) on delete cascade,
  dataset_id uuid references datasets(id) on delete cascade,
  body text,
  body_source text default 'openai-gpt4o',
  body_confidence numeric default 0.75,
  body_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table answers enable row level security;
drop policy if exists "answers_v1_read" on answers;
create policy "answers_v1_read" on answers for select using (true);
drop policy if exists "answers_v1_write" on answers;
create policy "answers_v1_write" on answers for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action_type text,
  dataset_id uuid,
  insight_id uuid,
  answer_id uuid,
  model_used text,
  prompt_tokens integer,
  completion_tokens integer,
  latency_ms integer,
  triggered_by text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into datasets (id, name, row_count, column_names, sample_rows, status) values
(
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Q1 2024 Sales by Region',
  480,
  '["Date","Region","Product","Revenue","Units"]',
  '[{"Date":"2024-01-03","Region":"North","Product":"Alpha","Revenue":1200,"Units":40},{"Date":"2024-01-04","Region":"South","Product":"Beta","Revenue":800,"Units":25},{"Date":"2024-01-05","Region":"East","Product":"Alpha","Revenue":2100,"Units":70}]',
  'ready'
),
(
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Website Traffic — March 2024',
  310,
  '["Date","Source","Sessions","Bounce_Rate","Conversions"]',
  '[{"Date":"2024-03-01","Source":"Organic","Sessions":1200,"Bounce_Rate":0.42,"Conversions":38},{"Date":"2024-03-02","Source":"Paid","Sessions":880,"Bounce_Rate":0.55,"Conversions":21},{"Date":"2024-03-03","Source":"Social","Sessions":430,"Bounce_Rate":0.61,"Conversions":9}]',
  'ready'
),
(
  'a1b2c3d4-0003-0003-0003-000000000003',
  'Student Exam Results — Spring Cohort',
  95,
  '["Student_ID","Subject","Score","Grade","Attendance_Pct"]',
  '[{"Student_ID":"S001","Subject":"Math","Score":82,"Grade":"B","Attendance_Pct":0.91},{"Student_ID":"S002","Subject":"Math","Score":67,"Grade":"D","Attendance_Pct":0.74},{"Student_ID":"S003","Subject":"Math","Score":95,"Grade":"A","Attendance_Pct":0.98}]',
  'ready'
);

insert into insights (dataset_id, summary, summary_source, summary_confidence, summary_review_status, trends, trends_source, trends_confidence, trends_review_status) values
(
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Sales peaked in January and March, driven primarily by Product Alpha in the North region. Overall revenue averaged $1,850 per transaction, with the East region outperforming others by 32%. June saw an 18% dip likely tied to seasonal demand slowdown.',
  'openai-gpt4o', 0.82, 'unreviewed',
  '[{"label":"East region leads revenue","direction":"up","magnitude":"high"},{"label":"Product Alpha dominates unit sales","direction":"up","magnitude":"high"},{"label":"June revenue decline","direction":"down","magnitude":"medium"}]',
  'openai-gpt4o', 0.80, 'unreviewed'
),
(
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Organic search is the top traffic driver with the lowest bounce rate (42%), suggesting high intent visitors. Paid traffic delivers volume but converts at half the organic rate. Social channels show the weakest conversion performance despite growing sessions in week 3.',
  'openai-gpt4o', 0.78, 'unreviewed',
  '[{"label":"Organic sessions highest quality","direction":"up","magnitude":"high"},{"label":"Paid bounce rate elevated","direction":"up","magnitude":"medium"},{"label":"Social conversions underperforming","direction":"down","magnitude":"medium"}]',
  'openai-gpt4o', 0.77, 'unreviewed'
),
(
  'a1b2c3d4-0003-0003-0003-000000000003',
  'The cohort average score is 74, with high attendance (above 90%) strongly correlating with scores above 80. Students with attendance below 80% averaged a D grade. Math is the most common subject in the dataset and shows the widest score spread.',
  'openai-gpt4o', 0.81, 'unreviewed',
  '[{"label":"Attendance predicts score","direction":"up","magnitude":"high"},{"label":"Wide score spread in Math","direction":"up","magnitude":"medium"},{"label":"Low-attendance students at risk","direction":"down","magnitude":"high"}]',
  'openai-gpt4o', 0.79, 'unreviewed'
);