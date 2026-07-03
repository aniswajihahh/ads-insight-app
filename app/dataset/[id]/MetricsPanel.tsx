"use client";

import { useEffect, useState } from "react";

interface Metric {
  id: string;
  column_name: string;
  metric_type: string;
  metric_value: number;
  metric_label: string;
}

export default function MetricsPanel({
  metrics,
  datasetId,
  allColumns,
}: {
  metrics: Metric[];
  datasetId: string;
  allColumns: string[];
}) {
  const storageKey = `metrics-sel-${datasetId}`;

  // Columns that have computed metrics, sorted by highest absolute value
  const metricColumns = Array.from(new Set(metrics.map((m) => m.column_name)));
  const colMax = (col: string) =>
    Math.max(0, ...metrics.filter((m) => m.column_name === col).map((m) => Math.abs(m.metric_value)));
  const metricColumnsSorted = [...metricColumns].sort((a, b) => colMax(b) - colMax(a));
  const defaultSelected = metricColumnsSorted.slice(0, 5);

  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [configOpen, setConfigOpen] = useState(false);

  // Load saved selection after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        // Only keep columns that still have metrics
        setSelected(parsed.filter((c) => metricColumns.includes(c)));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function toggle(col: string) {
    setSelected((prev) => {
      const next = prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const visible = metrics.filter((m) => selected.includes(m.column_name));
  const hasMetrics = metrics.length > 0;

  const fmt = (v: number) =>
    v >= 1000
      ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const metricTypeLabel: Record<string, string> = {
    sum: "Total",
    avg: "Average",
    max: "Peak",
    min: "Min",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Metric Highlights</h2>
        {hasMetrics && (
          <button
            onClick={() => setConfigOpen((o) => !o)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {configOpen ? "Done" : "Select columns"}
          </button>
        )}
      </div>

      {/* Column selector */}
      {configOpen && (
        <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
            Toggle columns to show in highlights
          </p>
          <div className="flex flex-wrap gap-2">
            {metricColumnsSorted.map((col) => (
              <button
                key={col}
                onClick={() => toggle(col)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selected.includes(col)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
          {selected.length === 0 && (
            <p className="text-xs text-amber-600 mt-2">Select at least one column to see metrics.</p>
          )}
        </div>
      )}

      {/* Metric cards */}
      {!hasMetrics ? (
        <p className="text-sm text-gray-400">No numeric columns detected.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-400">No columns selected — click &quot;Select columns&quot; above.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visible.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {metricTypeLabel[m.metric_type] ?? m.metric_type}
                </div>
                <div className="text-lg font-bold text-gray-900 tabular-nums">{fmt(m.metric_value)}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{m.column_name}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1">
            {visible.map((m) => (
              <p key={`${m.id}-label`} className="text-sm text-gray-600">• {m.metric_label}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
