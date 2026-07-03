import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { dataset_id, question_text } = await req.json();

    if (!dataset_id || !question_text?.trim()) {
      return NextResponse.json({ error: "dataset_id and question_text are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const [{ data: dataset }, { data: insight }] = await Promise.all([
      supabase.from("datasets").select("name, column_names, row_count").eq("id", dataset_id).single(),
      supabase.from("insights").select("summary, key_trends, anomalies").eq("dataset_id", dataset_id).order("version", { ascending: false }).limit(1).single(),
    ]);

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.3 },
    });

    const context = {
      dataset_name: dataset.name,
      row_count: dataset.row_count,
      columns: dataset.column_names,
      summary: insight?.summary ?? "No summary available.",
      key_trends: insight?.key_trends ?? [],
      anomalies: insight?.anomalies ?? [],
    };

    const prompt = `You are a data analyst. A user has a question about this dataset:

Dataset context:
${JSON.stringify(context, null, 2)}

User question: "${question_text}"

Answer directly and specifically. Use numbers from the dataset where relevant. Keep it under 150 words.`;

    let answer = "Unable to generate an answer.";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        answer = result.response.text() ?? "Unable to generate an answer.";
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

    const admin = createAdminClient();
    const { data: question, error: qErr } = await admin
      .from("questions")
      .insert({
        dataset_id,
        user_id: user.id,
        question_text: question_text.trim(),
        answer_text: answer,
        answer_source: "google/gemini-2.5-flash",
        answer_confidence: 0.8,
      })
      .select()
      .single();

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    await admin.from("audit_logs").insert({
      action: "ask_question",
      object_type: "question",
      object_id: question.id,
      user_id: user.id,
      metadata: { dataset_id, model: "gemini-2.5-flash" },
    });

    return NextResponse.json({ id: question.id, answer });
  } catch (err) {
    console.error("Ask error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
