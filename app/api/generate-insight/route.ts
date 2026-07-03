import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

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

  return `You are a data analyst. Analyze this dataset and return a JSON object with exactly these keys:
- summary: A 2-3 sentence plain-English summary of the dataset's key story. Be specific with numbers.
- key_trends: Array of 2-4 objects with "trend" (one sentence) and "direction" ("up", "down", or "neutral").
- anomalies: Array of 0-3 objects with "column" and "note" describing unusual values.

Dataset schema and sample:
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

    const supabase = await createClient();

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
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    });

    const prompt = buildPrompt(dataset_name, row_count, column_stats, sample_rows);
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let parsed: InsightResponse;
    try {
      parsed = JSON.parse(raw) as InsightResponse;
    } catch {
      parsed = { summary: raw, key_trends: [], anomalies: [] };
    }

    const { error: insightErr } = await supabase.from("insights").insert({
      dataset_id,
      summary: parsed.summary ?? "No summary generated.",
      summary_source: "google/gemini-1.5-flash",
      summary_confidence: 0.85,
      key_trends: parsed.key_trends ?? [],
      key_trends_source: "google/gemini-1.5-flash",
      key_trends_confidence: 0.82,
      anomalies: parsed.anomalies ?? [],
      anomalies_source: "google/gemini-1.5-flash",
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
      metadata: { model: "gemini-1.5-flash", dataset_name },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Generate insight error:", err);
    return NextResponse.json({ error: "Insight generation failed" }, { status: 500 });
  }
}
