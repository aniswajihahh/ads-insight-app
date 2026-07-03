# Intelligence Layer — Ads Insight App

## Messy Inputs
- Raw CSV/Excel with mixed column names, blank rows, inconsistent formats
- Numeric, categorical, date fields mixed without labels
- No context about what the data represents

## Auto-Structure Schema (JSON sent to AI)
```json
{
  "dataset_name": "sales_q1.csv",
  "row_count": 480,
  "columns": ["Date", "Region", "Product", "Revenue", "Units"],
  "sample_rows": [
    {"Date": "2024-01-03", "Region": "North", "Product": "A", "Revenue": 1200, "Units": 40}
  ],
  "numeric_stats": {"Revenue": {"min": 200, "max": 8400, "mean": 1850}}
}
```

## Events to Track
- Dataset uploaded
- Insight generated (latency, token count)
- Question asked
- Answer received
- User returns to a dataset

## Scoring Rules (v1 — rule-based)
- **Trend magnitude**: % change > 20% = high, 10–20% = medium, < 10% = low
- **Confidence**: assigned by OpenAI token probability proxy; default 0.75 if unavailable
- **Insight freshness**: score decays if dataset > 7 days old without re-analysis

## What Gets Ranked
- Trends sorted by magnitude (highest first)
- Questions shown newest-first

## v1 vs Later
- **v1**: GPT-4o summary + top trends + Q&A — all rule-prompted
- **Later**: fine-tuned domain prompts, anomaly detection, chart recommendations
