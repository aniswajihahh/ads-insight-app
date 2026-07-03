"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegenerateButtonProps {
  datasetId: string;
  datasetName: string;
  rowCount: number;
  columnNames: string[];
}

export default function RegenerateButton({ datasetId, datasetName, rowCount, columnNames }: RegenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetch("/api/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId,
          dataset_name: datasetName,
          row_count: rowCount,
          column_stats: columnNames.map((name) => ({ name, type: "string", sample: [] })),
          sample_rows: [],
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRegenerate}
      disabled={loading}
      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
    >
      {loading ? "Regenerating…" : "↻ Retry analysis"}
    </button>
  );
}
