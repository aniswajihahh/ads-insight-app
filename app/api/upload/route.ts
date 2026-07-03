import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";

interface ColumnStats {
  name: string;
  type: "numeric" | "string";
  sample: unknown[];
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  stddev?: number;
}

function computeColumnStats(rows: Record<string, unknown>[], columns: string[]): ColumnStats[] {
  return columns.map((col) => {
    const values = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== "");
    const numericValues = values
      .map((v) => parseFloat(String(v)))
      .filter((v) => !isNaN(v));

    if (numericValues.length > values.length * 0.5 && numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const avg = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const variance =
        numericValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / numericValues.length;
      const stddev = Math.sqrt(variance);
      return { name: col, type: "numeric", sample: values.slice(0, 5), min, max, avg, sum, stddev };
    }

    return { name: col, type: "string", sample: values.slice(0, 5) };
  });
}

function buildMetrics(
  datasetId: string,
  stats: ColumnStats[]
): { dataset_id: string; column_name: string; metric_type: string; metric_value: number; metric_label: string }[] {
  const metrics: ReturnType<typeof buildMetrics> = [];

  for (const stat of stats) {
    if (stat.type !== "numeric") continue;
    const fmt = (v: number) =>
      v >= 1000
        ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

    if (stat.max !== undefined)
      metrics.push({ dataset_id: datasetId, column_name: stat.name, metric_type: "max", metric_value: stat.max, metric_label: `Peak ${stat.name}: ${fmt(stat.max)}` });
    if (stat.min !== undefined)
      metrics.push({ dataset_id: datasetId, column_name: stat.name, metric_type: "min", metric_value: stat.min, metric_label: `Min ${stat.name}: ${fmt(stat.min)}` });
    if (stat.avg !== undefined)
      metrics.push({ dataset_id: datasetId, column_name: stat.name, metric_type: "avg", metric_value: stat.avg, metric_label: `Avg ${stat.name}: ${fmt(stat.avg)}` });
    if (stat.sum !== undefined)
      metrics.push({ dataset_id: datasetId, column_name: stat.name, metric_type: "sum", metric_value: stat.sum, metric_label: `Total ${stat.name}: ${fmt(stat.sum)}` });
  }

  // Sort by magnitude and take top 5
  return metrics
    .sort((a, b) => Math.abs(b.metric_value) - Math.abs(a.metric_value))
    .slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const namePart = (formData.get("name") as string | null)?.trim();
    const datasetName = namePart || file.name.replace(/\.[^.]+$/, "");

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isCSV = ext === "csv" || file.type === "text/csv";
    const isExcel = ["xlsx", "xls"].includes(ext);

    if (!isCSV && !isExcel) {
      return NextResponse.json({ error: "Only CSV and Excel files are supported" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let columns: string[] = [];
    let allRows: Record<string, unknown>[] = [];

    if (isCSV) {
      const text = new TextDecoder().decode(buffer);
      const result = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });
      columns = result.meta.fields ?? [];
      allRows = result.data;
    } else {
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      allRows = raw;
      columns = raw.length > 0 ? Object.keys(raw[0]) : [];
    }

    if (allRows.length === 0) {
      return NextResponse.json({ error: "File appears to be empty — please check and re-upload" }, { status: 400 });
    }

    const rowCount = allRows.length;
    const sampleRows = allRows.slice(0, 10);
    const stats = computeColumnStats(allRows, columns);

    const supabase = createAdminClient();

    const { data: dataset, error: dsErr } = await supabase
      .from("datasets")
      .insert({
        name: datasetName,
        column_names: columns,
        row_count: rowCount,
        file_type: isCSV ? "csv" : "excel",
        is_demo: false,
      })
      .select()
      .single();

    if (dsErr || !dataset) {
      return NextResponse.json({ error: dsErr?.message ?? "Failed to create dataset" }, { status: 500 });
    }

    // Compute and store rule-based metrics
    const metricRows = buildMetrics(dataset.id, stats);
    if (metricRows.length > 0) {
      await supabase.from("metrics").insert(metricRows);
    }

    // Log upload
    await supabase.from("audit_logs").insert({
      action: "upload",
      object_type: "dataset",
      object_id: dataset.id,
      metadata: { row_count: rowCount, column_count: columns.length, file_type: isCSV ? "csv" : "excel" },
    });

    // Generate insight via internal API call (server-side fetch)
    const origin = req.nextUrl.origin;
    fetch(`${origin}/api/generate-insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: dataset.id,
        dataset_name: datasetName,
        row_count: rowCount,
        column_stats: stats,
        sample_rows: sampleRows,
      }),
    }).catch(() => {
      // Fire-and-forget; insight will show "Analysis pending" if this fails
    });

    return NextResponse.json({ id: dataset.id });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
