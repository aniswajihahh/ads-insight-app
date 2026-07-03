"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ datasetId, isDemo }: { datasetId: string; isDemo: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDemo) return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete this dataset?</span>
        <button
          onClick={async () => {
            setLoading(true);
            await fetch(`/api/datasets/${datasetId}`, { method: "DELETE" });
            router.push("/datasets");
          }}
          disabled={loading}
          className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-600 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Delete dataset
    </button>
  );
}
