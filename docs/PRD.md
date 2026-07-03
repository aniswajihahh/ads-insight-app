# Product Requirements — ads-insight-app

## Problem
Analyzing CSVs, spreadsheets, and reports manually is slow and error-prone. Most users who *have* data don't have time to make sense of it.

## Target Users
- Marketers reading campaign reports
- Business owners reviewing sales data
- Analysts who need a fast second opinion
- Students or job seekers learning to work with data

## Core Objects
| Object | Purpose |
|---|---|
| `dataset` | Uploaded file + metadata (name, columns, row count) |
| `insight` | AI summary, key trends, anomalies for a dataset |
| `metric` | Auto-computed column-level stats (max, avg, trend) |
| `question` | User-submitted question + AI answer about a dataset |
| `audit_log` | Record of every meaningful action |

## MVP Checklist (v1)
- [ ] Upload CSV or Excel file
- [ ] Parse column names and row count
- [ ] Generate plain-language summary + key trends via AI
- [ ] Display metric highlight cards (top 5 computed stats)
- [ ] Ask a question about the dataset; get an AI answer
- [ ] Demo datasets pre-loaded; app is usable without uploading
- [ ] No login required in v1

## Non-Goals (v1)
- User accounts or authentication
- Real-time data connections (APIs, Google Sheets)
- Advanced ML or forecasting models
- Team collaboration or sharing
- Automated alerts or scheduled re-analysis

## Success Criteria
**End-to-end scenario:** A marketer uploads a 12-month campaign CSV → within 30 seconds sees a plain-English summary ("Campaign C had the best ROI; Campaign A is underperforming"), three metric highlights, and two key trends — then asks "which campaign should I cut?" and gets a direct answer. Total time: under 2 minutes. Previously took 30–60 minutes of manual analysis.
