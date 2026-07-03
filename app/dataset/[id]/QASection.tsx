"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  created_at: string;
}

interface QASectionProps {
  datasetId: string;
  initialQuestions: Question[];
}

export default function QASection({ datasetId, initialQuestions }: QASectionProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_id: datasetId, question_text: text }),
      });

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to get answer");
        return;
      }

      const newQ: Question = {
        id: data.id,
        question_text: text,
        answer_text: data.answer,
        created_at: new Date().toISOString(),
      };
      setQuestions((prev) => [newQ, ...prev]);
      setInput("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Ask a Question</h2>

      <form onSubmit={handleAsk} className="flex gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Which campaign should I cut?"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Ask a question about this data above.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border-l-4 border-indigo-200 pl-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Q: {q.question_text}</p>
              <p className="text-sm text-gray-700">{q.answer_text ?? "Generating answer…"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
