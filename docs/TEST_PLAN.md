# Test Plan — Ads Insight App

## Core Success Scenario (Manual)
1. Open homepage — demo dataset insight visible without login ✓
2. Click "Upload your data" — drag-drop a 200-row sales CSV
3. See processing spinner → results page loads within 30s
4. Verify: plain-English summary displayed (not empty, not raw JSON)
5. Verify: at least 3 trends listed with labels and direction (up/down)
6. Type question: "Which product had the highest revenue?" → submit
7. Verify: answer appears within 15s, references correct column/value
8. Refresh page → answer and insight still visible (persisted to DB)
9. Navigate to `/datasets` → new dataset appears in list
10. Check Supabase dashboard: rows in `datasets`, `insights`, `questions`, `answers`, `audit_logs`

## Empty / Edge Cases
- Upload a file with no numeric columns → show friendly message: "No numeric data found to analyze"
- Upload an empty CSV (headers only) → error state: "Dataset has no rows"
- Submit a blank question → form validation: "Please enter a question"
- OpenAI API timeout → show: "Insight generation failed — please try again"
- Upload a non-CSV/Excel file → reject with: "Only CSV and Excel files are supported"

## Error Cases
- Supabase storage upload fails → surface error on upload page, do not create `dataset` row
- OpenAI returns empty response → mark insight status 'error', log to audit_logs, show retry button
- Dataset ID not found (direct URL) → 404 page with link back to homepage

## Performance Check
- 500-row CSV: upload + parse + insight < 30 seconds end-to-end
- Q&A response < 15 seconds
