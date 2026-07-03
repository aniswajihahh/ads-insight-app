# Product Requirements — Ads Insight App

## Problem
Analyzing data (CSVs, spreadsheets, reports) takes hours of manual effort. Non-technical users — marketers, business owners, students — need fast, plain-language answers from their data without becoming analysts.

## Target User
Primary: Marketers and business owners who upload performance data and need quick answers. Secondary: Students and analysts who want fast summaries without deep manual digging.

## Core Objects
- **Dataset** — uploaded file (CSV/Excel), raw data, metadata
- **Insight** — AI-generated summary, key trends, anomalies per dataset
- **Question** — user's follow-up natural-language query on a dataset
- **Answer** — AI response to a Question, with confidence + source

## MVP Must-Haves
- [ ] Upload a CSV or Excel file
- [ ] Parse and store structured row/column data
- [ ] Auto-generate: plain-language summary + top 3–5 key trends
- [ ] Display insights on a clean results screen
- [ ] Ask a follow-up question about the dataset, get an AI answer
- [ ] Seed demo dataset visible without login

## Non-Goals (v1)
- User accounts / login
- Real-time API data sync
- Advanced ML models
- Team collaboration
- Automated alerts
- Multi-file cross-analysis

## Success Criteria
A marketer uploads a 500-row sales CSV → within 30 seconds sees a plain-English summary ("Sales peaked in March, driven by Product A. Revenue dropped 18% in June.") + 3 ranked trends + can ask "Which region performed best?" and get an accurate answer — all without opening a spreadsheet.
