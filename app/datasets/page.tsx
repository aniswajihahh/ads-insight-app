import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DatasetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: datasets } = await supabase
    .from("datasets")
    .select("id, name, description, row_count, column_names, is_demo, created_at, insights(summary)")
    .order("created_at", { ascending: false });

  const uploaded = datasets?.filter((d) => !d.is_demo) ?? [];
  const demos = datasets?.filter((d) => d.is_demo) ?? [];

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">Ads Insight</Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
            <Link
              href="/upload"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">All Datasets</h1>

        {uploaded.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mb-10">
            <p className="text-gray-500 text-lg mb-2">No datasets uploaded yet</p>
            <p className="text-gray-400 text-sm mb-6">Upload your first CSV or Excel file to get started.</p>
            <Link
              href="/upload"
              className="inline-block bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upload your first dataset
            </Link>
          </div>
        ) : (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploaded.map((ds) => (
                <DatasetCard key={ds.id} ds={ds} />
              ))}
            </div>
          </section>
        )}

        {demos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Demo Datasets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demos.map((ds) => (
                <DatasetCard key={ds.id} ds={ds} isDemo />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function DatasetCard({
  ds,
  isDemo = false,
}: {
  ds: {
    id: string;
    name: string;
    description: string | null;
    row_count: number | null;
    column_names: unknown;
    insights: { summary: string }[] | { summary: string } | null;
  };
  isDemo?: boolean;
}) {
  const insight = Array.isArray(ds.insights) ? ds.insights[0] : ds.insights;
  const summary = insight?.summary;
  const columns = Array.isArray(ds.column_names) ? (ds.column_names as string[]) : [];

  return (
    <Link href={`/dataset/${ds.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{ds.name}</h3>
          {isDemo && (
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded ml-2 shrink-0">Demo</span>
          )}
        </div>
        {ds.description && <p className="text-sm text-gray-500 mb-2">{ds.description}</p>}
        {summary && (
          <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-3">{summary}</p>
        )}
        <div className="pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
          <span>{ds.row_count?.toLocaleString() ?? "?"} rows</span>
          <span>{columns.length} columns</span>
        </div>
      </div>
    </Link>
  );
}
