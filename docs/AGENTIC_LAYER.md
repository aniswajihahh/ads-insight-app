# Agentic Layer — ads-insight-app

## Risk Levels & Actions

### Low — Auto-execute (no approval needed)
| Action | Trigger | Tool |
|---|---|---|
| Generate insight summary | Dataset uploaded | `generate_insight(dataset_id)` |
| Compute metric highlights | Columns parsed | `compute_metrics(dataset_id)` |
| Answer user question | Question submitted | `answer_question(question_id)` |
| Tag anomalies | Insight generated | `tag_anomalies(insight_id)` |

### Medium — Confirm before running *(v1: not yet built)*
| Action | Why Approval |
|---|---|
| Regenerate insight (overwrites v1) | Destroys prior version |
| Delete dataset | Removes all child records |

### High — Always approval *(later)*
| Action | Why |
|---|---|
| Share insight publicly | Exposes user data |
| Export + email report | External communication |

### Critical — Human only *(later)*
| Action | Why |
|---|---|
| Bulk delete all datasets | Irreversible data loss |
| Admin review of flagged AI output | Trust & safety |

## Named Tools (approved list)
- `generate_insight` — calls OpenAI, writes to `insights`
- `compute_metrics` — rule-based, writes to `metrics`
- `answer_question` — calls OpenAI with dataset context, writes to `questions`
- `tag_anomalies` — rule-based, updates `insights.anomalies`
- `log_action` — writes to `audit_logs`

## Audit Log Fields
`action`, `object_type`, `object_id`, `user_id`, `metadata` (prompt hash, model, token count), `created_at`

## v1 vs Later
- v1: low-risk auto actions only
- Later: approval flow UI for medium-risk; human review queue for flagged insights
