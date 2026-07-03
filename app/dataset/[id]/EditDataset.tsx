"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditDatasetProps {
  datasetId: string;
  initialName: string;
  initialDescription: string | null;
  isDemo: boolean;
}

export default function EditDataset({ datasetId, initialName, initialDescription, isDemo }: EditDatasetProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  if (isDemo) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{initialName}</h1>
        {initialDescription && <p className="text-gray-500 mt-1">{initialDescription}</p>}
      </div>
    );
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5"
          >
            Edit
          </button>
        </div>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
    );
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/datasets/${datasetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional description"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => { setName(initialName); setDescription(initialDescription ?? ""); setEditing(false); }}
          className="text-sm text-gray-600 px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
