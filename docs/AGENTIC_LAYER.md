# Agentic Layer — Ads Insight App

## Risk Levels & Actions

### Low — Auto-execute (no approval needed)
- `generate_insight(dataset_id)` — summarize dataset, extract trends, store in `insights`
- `answer_question(question_id)` — answer user query using dataset context, store in `answers`
- `tag_columns(dataset_id)` — classify column types (date, numeric, categorical)

### Medium — Light approval (user confirms)
- `re_analyze_dataset(dataset_id)` — re-run insight generation on updated or re-uploaded data
- `flag_insight(insight_id, reason)` — mark insight for human review

### High — Always requires explicit approval
- `delete_dataset(dataset_id)` — removes file from storage + all related records

### Critical — Human-only
- Bulk data deletion, any export to external systems

## Named Tools (v1)
- `openai_chat_completion` — only tool for AI calls; prompt + model hardcoded server-side
- `supabase_storage_upload` — file ingest only
- `supabase_db_write` — scoped inserts/updates to app tables only

## Audit Log Fields (on every AI action)
`action_type`, `dataset_id`, `insight_id / answer_id`, `model_used`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `triggered_by`, `created_at`

## v1 vs Later
- **v1**: auto-generate insight on upload; auto-answer questions
- **Later**: scheduled re-analysis, proactive anomaly alerts (high approval), Slack/email delivery (high approval)
