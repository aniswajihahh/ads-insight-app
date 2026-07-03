import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import QASection from "./QASection";
import DeleteButton from "./DeleteButton";
import EditDataset from "./EditDataset";
import RegenerateButton from "./RegenerateButton";
import LogoutButton from "@/app/components/LogoutButton";

export const dynamic = "force-dynamic";

interface Trend {
  trend: string;
  direction: "up" | "down" | "neutral";
}

interface Anomaly {
  column: string;
  note: string;
}

interface Metric {
  id: string;
  column_name: string;
  metric_type: string;
  metric_value: number;
  metric_label: string;
}

interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  created_at: string;
}

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dataset, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !dataset) notFound();

  const [{ data: insights }, { data: metrics }, { data: questions }] = await Promise.all([
    supabase.from("insights").select("*").eq("dataset_id", id).order("version", { ascending: false }).limit(1),
    supabase.from("metrics").select("*").eq("dataset_id", id).order("metric_value", { ascending: false }),
    supabase.from("questions").select("*").eq("dataset_id", id).order("created_at", { ascending: false }),
  ]);

  const insight = insights?.[0] ?? null;
  const columns = Array.isArray(dataset.column_names) ? (dataset.column_names as string[]) : [];
  const trends: Trend[] = Array.isArray(insight?.key_trends) ? (insight.key_trends as Trend[]) : [];
  const anomalies: Anomaly[] = Array.isArray(insight?.anomalies) ? (insight.anomalies as Anomaly[]) : [];
  const metricList: Metric[] = (metrics ?? []) as Metric[];
  const questionList: Question[] = (questions ?? []) as Question[];

  const directionIcon = (d: Trend["direction"]) =>
    d === "up" ? "↑" : d === "down" ? "↓" : "→";
  const directionColor = (d: Trend["direction"]) =>
    d === "up" ? "text-green-600" : d === "down" ? "text-red-500" : "text-gray-500";

  const isPending = !insight || insight.summary?.includes("Analysis pending");

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">Ads Insight</Link>
          <div className="flex items-center gap-4">
            <Link href="/datasets" className="text-sm text-gray-600 hover:text-gray-900">← All Datasets</Link>
            {user ? (
              <>
                <Link href="/upload" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Upload CSV
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
                <Link href="/upload" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Upload CSV
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <EditDataset
            datasetId={id}
            initialName={dataset.name}
            initialDescription={dataset.description}
            isDemo={dataset.is_demo}
          />
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <span className="text-sm text-gray-400">
              {dataset.row_count?.toLocaleString()} rows · {columns.length} columns
            </span>
            <DeleteButton datasetId={id} isDemo={dataset.is_demo} />
          </div>
        </div>

        {/* Column list */}
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <span key={col} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {col}
            </span>
          ))}
        </div>

        {/* AI Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">AI Summary</h2>
            {isPending && (
              <RegenerateButton
                datasetId={id}
                datasetName={dataset.name}
                rowCount={dataset.row_count ?? 0}
                columnNames={columns}
              />
            )}
          </div>
          {isPending ? (
            <div className="flex items-center gap-3 text-gray-500">
              <span className="animate-spin text-xl">⟳</span>
              <span className="text-sm">AI analysis in progress… refresh in a few seconds.</span>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">{insight.summary}</p>
          )}

          {insight?.summary_confidence !== null && insight?.summary_confidence < 0.7 && (
            <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
              Low confidence — review recommended
            </div>
          )}
        </div>

        {/* Trends + Anomalies */}
        {(trends.length > 0 || anomalies.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Key Trends</h2>
                <ul className="space-y-3">
                  {trends.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`text-lg font-bold ${directionColor(t.direction)} shrink-0`}>
                        {directionIcon(t.direction)}
                      </span>
                      <span className="text-sm text-gray-700">{t.trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {anomalies.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Anomalies</h2>
                <ul className="space-y-3">
                  {anomalies.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-amber-500 shrink-0">⚠</span>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{a.column}</span>
                        <p className="text-sm text-gray-700">{a.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Metric highlights */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Metric Highlights</h2>
          {metricList.length === 0 ? (
            <p className="text-sm text-gray-400">No numeric columns detected.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {metricList.map((m) => (
                <div key={m.id} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{m.metric_type}</div>
                  <div className="text-lg font-bold text-gray-900">
                    {m.metric_value >= 1000
                      ? m.metric_value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                      : m.metric_value.toLocaleString("en-US", { maximumFractionDigits: 3 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{m.column_name}</div>
                </div>
              ))}
            </div>
          )}
          {metricList.length > 0 && (
            <div className="mt-4 space-y-1">
              {metricList.map((m) => (
                <p key={`${m.id}-label`} className="text-sm text-gray-600">• {m.metric_label}</p>
              ))}
            </div>
          )}
        </div>

        {/* Q&A */}
        <QASection datasetId={id} initialQuestions={questionList} />
      </main>
    </div>
  );
}
