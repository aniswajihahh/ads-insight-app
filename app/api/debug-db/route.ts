import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Missing env vars", url: !!url, key: !!key });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("datasets")
      .select("id, name")
      .eq("is_demo", true);

    return NextResponse.json({
      url: url.substring(0, 30) + "...",
      keyPrefix: key.substring(0, 15) + "...",
      data,
      error,
      count: data?.length ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ caught: String(err) }, { status: 500 });
  }
}
