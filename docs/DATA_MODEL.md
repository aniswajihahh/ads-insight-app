# Data Model — ads-insight-app

## datasets
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable; owner after auth sprint |
| name | text | user-provided or filename |
| description | text | optional |
| row_count | integer | parsed on upload |
| column_names | jsonb | array of column name strings |
| file_url | text | Supabase Storage URL |
| file_type | text | 'csv' or 'excel' |
| is_demo | boolean | true for seeded rows |
| share_token | text | unique; enables public read link |
| created_at | timestamptz | |

## insights *(AI fields — store value + source + confidence + review_status)*
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| dataset_id | uuid FK → datasets | cascade delete |
| summary | text | AI value |
| summary_source | text | e.g. 'openai/gpt-4o' |
| summary_confidence | numeric | 0–1 |
| summary_review_status | text | 'unreviewed' / 'approved' / 'flagged' |
| key_trends | jsonb | [{trend, direction}] — AI value |
| key_trends_source / _confidence / _review_status | text/numeric/text | |
| anomalies | jsonb | [{column, note}] — AI value |
| anomalies_source / _confidence / _review_status | text/numeric/text | |
| version | integer | increments on regeneration |
| created_at | timestamptz | |

## metrics *(label is AI-assisted)*
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| dataset_id | uuid FK → datasets | |
| column_name | text | |
| metric_type | text | 'max' / 'min' / 'avg' / 'sum' / 'trend' |
| metric_value | numeric | rule-computed |
| metric_label | text | plain-language label (AI) |
| metric_label_source / _confidence / _review_status | text/numeric/text | |
| created_at | timestamptz | |

## questions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| dataset_id | uuid FK → datasets | |
| question_text | text | |
| answer_text | text | AI value |
| answer_source / _confidence / _review_status | text/numeric/text | |
| created_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| action | text | e.g. 'upload', 'generate_insight', 'ask_question' |
| object_type | text | 'dataset' / 'insight' / 'question' |
| object_id | uuid | |
| metadata | jsonb | extra context |
| created_at | timestamptz | |

## RLS
- All tables: v1 open policies (select + all — true). Replaced in Lock-Down sprint with `auth.uid() = user_id`.
