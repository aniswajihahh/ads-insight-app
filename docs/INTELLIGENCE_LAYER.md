# Intelligence Layer — ads-insight-app

## Messy Inputs
- Raw CSV/Excel with unnamed columns, mixed types, missing values
- No context about what the data means
- Columns like `col_A`, `revenue_usd`, `month`, `CTR%`

## Auto-Structure Schema (sent to AI)
```json
{
  "dataset_name": "Q4 Sales Report",
  "row_count": 90,
  "columns": [
    {"name": "month", "type": "string", "sample": ["Oct", "Nov", "Dec"]},
    {"name": "revenue", "type": "numeric", "min": 41000, "max": 84000, "avg": 61250}
  ],
  "sample_rows": [
    {"month": "Oct", "revenue": 84000},
    {"month": "Nov", "revenue": 65000}
  ]
}
```

## Events Tracked
- Dataset uploaded
- Insight generated (version N)
- Question asked + answered
- Insight regenerated
- Insight card copied or exported

## Scoring Rules (v1 — rule-based first)
| Signal | Score |
|---|---|
| Numeric column detected | +1 metric generated |
| Value > 2 std devs from mean | flagged as anomaly |
| Monotonic increase/decrease ≥ 3 periods | trend direction = up/down |
| AI confidence < 0.6 | review_status = 'flagged' |

## What Gets Ranked
- Metric highlights sorted by: anomaly flag > large % change > high absolute value
- Trends ordered by magnitude of change

## v1 vs Later
| v1 | Later |
|---|---|
| GPT-4o summary + trends | Fine-tuned domain-specific model |
| Rule-based metric detection | Statistical anomaly detection (z-score, IQR) |
| Single-pass insight | Multi-turn conversation with memory |
