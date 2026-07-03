"use client";

import { useEffect, useState } from "react";

interface Metric {
  id: string;
  column_name: string;
  metric_type: string;
  metric_value: number;
  metric_label: string;
}

export default function MetricsPanel({ metrics, datasetId }: { metrics: Metric[]; datasetId: string }) {
  const storageKey = `metrics-sel-${datasetId}`;

  // Unique columns sorted by their highest absolute metric value
  const allColumns = Array.from(new Set(metrics.map((m) => m.column_name)));
  const colMax = (col: string) =>
    Math.max(...metrics.filter((m) => m.column_name === col).map((m) => Math.abs(m.metric_value)));
  const columnsSorted = [...allColumns].sort((a, b) => colMax(b) - colMax(a));
  const defaultSelected = columnsSorted.slice(0, 5);

  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [configOpen, setConfigOpen] = useState(false);

  // Load saved selection after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setSelected(JSON.parse(saved) as string[]);
    } catch {}
  }, [storageKey]);

  function toggle(col: string) {
    setSelected((prev) => {
      const next = prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const visible = metrics.filter((m) => selected.includes(m.column_name));

  const fmt = (v: number) =>
    v >= 1000
      ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : v.toLocaleString("en-US", { maximumFractionDigits: 3 });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Metric Highlights</h2>
        {allColumns.length > 0 && (
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
            Choose which columns to show
          </p>
          <div className="flex flex-wrap gap-2">
            {columnsSorted.map((col) => (
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
      {visible.length === 0 ? (
        <p className="text-sm text-gray-400">
          {allColumns.length === 0 ? "No numeric columns detected." : "No columns selected."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visible.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{m.metric_type}</div>
                <div className="text-lg font-bold text-gray-900">{fmt(m.metric_value)}</div>
                <div className="text-xs text-gray-500 mt-1">{m.column_name}</div>
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
