# Data Model — Ads Insight App

## datasets
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner (null = demo) |
| name | text | filename or user label |
| row_count | integer | parsed row total |
| column_names | jsonb | array of column header strings |
| sample_rows | jsonb | first 20 rows for AI context |
| storage_path | text | Supabase Storage path |
| status | text | 'processing' / 'ready' / 'error' |
| created_at | timestamptz | |

## insights
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| dataset_id | uuid FK → datasets | |
| user_id | uuid nullable | |
| summary | text | AI plain-language summary |
| summary_source | text | 'openai-gpt4o' |
| summary_confidence | numeric | 0–1 |
| summary_review_status | text | 'unreviewed' / 'approved' / 'flagged' |
| trends | jsonb | array of {label, direction, magnitude} |
| trends_source | text | |
| trends_confidence | numeric | |
| trends_review_status | text | |
| created_at | timestamptz | |

## questions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| dataset_id | uuid FK → datasets | |
| user_id | uuid nullable | |
| body | text | user's natural-language question |
| created_at | timestamptz | |

## answers
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| question_id | uuid FK → questions | |
| dataset_id | uuid FK → datasets | |
| user_id | uuid nullable | |
| body | text | AI answer text |
| body_source | text | 'openai-gpt4o' |
| body_confidence | numeric | |
| body_review_status | text | 'unreviewed' |
| created_at | timestamptz | |

## RLS
All tables: RLS enabled. v1 policies = fully open (select + all). Lock-down sprint replaces with `auth.uid() = user_id`.
