import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";

interface ColumnStats {
  name: string;
  type: "numeric" | "string";
  sample: unknown[];
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
}

interface InsightResponse {
  summary: string;
  key_trends: { trend: string; direction: "up" | "down" | "neutral" }[];
  anomalies: { column: string; note: string }[];
}

function buildPrompt(
  datasetName: string,
  rowCount: number,
  columnStats: ColumnStats[],
  sampleRows: Record<string, unknown>[]
): string {
  const schema = {
    dataset_name: datasetName,
    row_count: rowCount,
    columns: columnStats.map((s) => ({
      name: s.name,
      type: s.type,
      ...(s.type === "numeric"
        ? { min: s.min, max: s.max, avg: s.avg }
        : { sample: s.sample.slice(0, 3) }),
    })),
    sample_rows: sampleRows.slice(0, 5),
  };

  return `You are a senior marketing and data analyst. A business decision-maker needs to act on this data — they want to know what is working, what is wasting money, and exactly what to do next. Be specific: use real numbers, name actual campaigns or ads from the sample rows, and give concrete conclusions.

Return a JSON object with exactly these keys:

- summary: 3-4 sentences. Cover: (1) what this dataset represents and the date range if visible, (2) the single most important performance number (e.g. total spend, total leads, average CPL), (3) the headline win and the headline problem. Write for someone who will make a budget decision in the next 5 minutes.

- key_trends: Array of 4-6 objects, each with "trend" (1-2 sentences with specific numbers and campaign/ad names where visible) and "direction" ("up" = good/positive, "down" = bad/negative, "neutral"). Cover: best-performing campaign or ad, worst-performing, cost efficiency trend, volume trend, and any notable shift. Be direct — say "Campaign X spent SGD 500 with 0 leads" not "some campaigns underperformed".

- anomalies: Array of 2-4 objects with "column" (the metric name) and "note" (1 sentence explaining why this is a red flag or outlier and what to check). Flag: zero-lead campaigns still spending, unusually high CPL vs average, CTR outliers, duplicate or suspicious rows.

Dataset schema and sample data:
${JSON.stringify(schema, null, 2)}

Return ONLY valid JSON, no markdown, no explanation.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dataset_id, dataset_name, row_count, column_stats, sample_rows } = body;

    if (!dataset_id) {
      return NextResponse.json({ error: "dataset_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (!process.env.GEMINI_API_KEY) {
      await supabase.from("insights").insert({
        dataset_id,
        summary: "Analysis pending — Gemini API key not configured.",
        key_trends: [],
        anomalies: [],
        summary_confidence: 0,
        version: 1,
      });
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    });

    const prompt = buildPrompt(dataset_name, row_count, column_stats, sample_rows);
    let raw = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        raw = result.response.text();
        break;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (attempt < 2 && msg.includes("503")) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }

    let parsed: InsightResponse;
    try {
      parsed = JSON.parse(raw) as InsightResponse;
    } catch {
      parsed = { summary: raw, key_trends: [], anomalies: [] };
    }

    const { error: insightErr } = await supabase.from("insights").insert({
      dataset_id,
      summary: parsed.summary ?? "No summary generated.",
      summary_source: "google/gemini-2.5-flash",
      summary_confidence: 0.85,
      key_trends: parsed.key_trends ?? [],
      key_trends_source: "google/gemini-2.5-flash",
      key_trends_confidence: 0.82,
      anomalies: parsed.anomalies ?? [],
      anomalies_source: "google/gemini-2.5-flash",
      anomalies_confidence: 0.78,
      version: 1,
    });

    if (insightErr) {
      return NextResponse.json({ error: insightErr.message }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "generate_insight",
      object_type: "insight",
      object_id: dataset_id,
      metadata: { model: "gemini-2.5-flash", dataset_name },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Generate insight error:", err);
    return NextResponse.json({ error: "Insight generation failed" }, { status: 500 });
  }
}
