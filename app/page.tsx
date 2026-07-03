import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: datasets } = await supabase
    .from("datasets")
    .select("id, name, description, row_count, column_names, insights(summary)")
    .eq("is_demo", true)
    .order("created_at", { ascending: true });

  const { count: uploadedCount } = await supabase
    .from("datasets")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", false);

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">Ads Insight</Link>
          <div className="flex items-center gap-4">
            <Link href="/datasets" className="text-sm text-gray-600 hover:text-gray-900">
              All Datasets {uploadedCount ? `(${uploadedCount} uploaded)` : ""}
            </Link>
            <Link
              href="/upload"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Turn data into insight in seconds
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Upload a CSV or Excel file. Get an AI-generated plain-English summary, key trends, metric highlights, and answers to your questions — no manual analysis required.
          </p>
          <Link
            href="/upload"
            className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-lg"
          >
            Upload your data →
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Try a demo dataset</h2>
          <p className="text-sm text-gray-500 mb-6">Click any card to explore the full AI analysis, metrics, and Q&amp;A.</p>

          {datasets && datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {datasets.map((ds) => {
                const insight = Array.isArray(ds.insights) ? ds.insights[0] : null;
                const summary = insight?.summary as string | undefined;
                const columns = Array.isArray(ds.column_names) ? (ds.column_names as string[]) : [];
                return (
                  <Link key={ds.id} href={`/dataset/${ds.id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-md transition-all h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">{ds.name}</h3>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded ml-2 shrink-0">Demo</span>
                      </div>
                      {ds.description && (
                        <p className="text-sm text-gray-500 mb-3">{ds.description}</p>
                      )}
                      {summary && (
                        <p className="text-sm text-gray-700 mb-4 flex-1 line-clamp-3">{summary}</p>
                      )}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <span>{ds.row_count?.toLocaleString()} rows</span>
                        <span>{columns.length} columns</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Demo datasets are loading…</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
