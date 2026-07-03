# Test Plan — ads-insight-app

## 1. Core Success Scenario (manual)
| Step | Action | Expected Result |
|---|---|---|
| 1 | Open homepage | 3 demo dataset cards visible; no login prompt |
| 2 | Click demo "E-Commerce Monthly Sales" | Dataset detail page opens; summary card, 3 trends, 2 metric highlights visible |
| 3 | Go to `/upload` | Drag-and-drop area visible |
| 4 | Upload a real CSV (≥ 5 columns, 20+ rows) | File accepted; "Analyzing..." spinner shown |
| 5 | Wait for insight | Summary card appears with plain-English text within 30s |
| 6 | Check metric highlights | At least 3 metric cards rendered with column name + value |
| 7 | Type question: "What is the biggest trend?" | Answer appears within 10s |
| 8 | Refresh page | Dataset, insight, and Q&A history still visible |
| 9 | Delete dataset | Dataset removed; returns to list; row gone from DB |

## 2. Empty States
| Scenario | Expected |
|---|---|
| No datasets uploaded yet | "Upload your first dataset" prompt with upload CTA |
| Dataset has no numeric columns | Metrics section shows "No numeric columns detected" |
| No questions asked yet | "Ask a question about this data" placeholder |

## 3. Error States
| Scenario | Expected |
|---|---|
| Upload non-CSV/Excel file | "Only CSV and Excel files are supported" error toast |
| OpenAI call fails (simulate by revoking key) | "Analysis failed — retry" button; metric cards still shown (rule-based) |
| Upload empty file (0 rows) | "File appears to be empty — please check and re-upload" |
| Ask question with blank input | Submit button disabled; no API call fired |

## 4. Data Integrity
- Upload same file twice → two separate `datasets` rows created (no dedup in v1)
- Regenerate insight → new `insights` row with version = 2; original row preserved
- Delete dataset → cascade deletes `insights`, `metrics`, `questions` rows for that dataset
