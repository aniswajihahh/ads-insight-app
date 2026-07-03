import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { dataset_id, question_text } = await req.json();

    if (!dataset_id || !question_text?.trim()) {
      return NextResponse.json({ error: "dataset_id and question_text are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const [{ data: dataset }, { data: insight }] = await Promise.all([
      supabase.from("datasets").select("name, column_names, row_count").eq("id", dataset_id).single(),
      supabase.from("insights").select("summary, key_trends, anomalies").eq("dataset_id", dataset_id).order("version", { ascending: false }).limit(1).single(),
    ]);

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const answer = completion.choices[0].message.content ?? "Unable to generate an answer.";

    const { data: question, error: qErr } = await supabase
      .from("questions")
      .insert({
        dataset_id,
        question_text: question_text.trim(),
        answer_text: answer,
        answer_source: "openai/gpt-4o",
        answer_confidence: 0.8,
      })
      .select()
      .single();

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "ask_question",
      object_type: "question",
      object_id: question.id,
      metadata: { dataset_id, model: "gpt-4o", tokens: completion.usage?.total_tokens },
    });

    return NextResponse.json({ id: question.id, answer });
  } catch (err) {
    console.error("Ask error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
