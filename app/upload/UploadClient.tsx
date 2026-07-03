"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((acceptedFiles: File[], rejected: { file: File }[]) => {
    if (rejected.length > 0) {
      setErrorMsg("Only CSV and Excel files are supported");
      setStatus("error");
      return;
    }
    const f = acceptedFiles[0];
    setFile(f);
    setName(f.name.replace(/\.[^.]+$/, ""));
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim() || file.name.replace(/\.[^.]+$/, ""));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=/upload");
          return;
        }
        setErrorMsg(data.error ?? "Upload failed");
        setStatus("error");
        return;
      }

      setStatus("analyzing");
      // Small delay to let the insight generation kick off, then redirect
      setTimeout(() => router.push(`/dataset/${data.id}`), 1500);
    } catch {
      setErrorMsg("Network error — please try again");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">Ads Insight</Link>
          <div className="flex items-center gap-4">
            <Link href="/datasets" className="text-sm text-gray-600 hover:text-gray-900">All Datasets</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">Upload a Dataset</h1>
        <p className="text-gray-500 mb-8 text-sm">CSV or Excel files supported. AI analysis begins automatically.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-indigo-400 bg-white"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                <div className="text-3xl mb-2">📊</div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB — click or drop to replace
                </p>
              </div>
            ) : isDragActive ? (
              <div>
                <div className="text-3xl mb-2">📂</div>
                <p className="font-medium text-indigo-600">Drop your file here</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">📁</div>
                <p className="font-medium text-gray-700">Drag & drop your CSV or Excel file</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            )}
          </div>

          {/* Name input */}
          {file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dataset name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Give it a descriptive name"
              />
            </div>
          )}

          {/* Error */}
          {status === "error" && errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Status messages */}
          {status === "uploading" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="animate-spin">⟳</span> Uploading and parsing file…
            </div>
          )}
          {status === "analyzing" && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="animate-spin">⟳</span> Analyzing with AI… redirecting to your insight
            </div>
          )}

          <button
            type="submit"
            disabled={!file || status === "uploading" || status === "analyzing"}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "uploading" || status === "analyzing" ? "Processing…" : "Analyze Dataset"}
          </button>
        </form>
      </main>
    </div>
  );
}
