import { createClient } from "@/lib/supabase/server";
import { getUsageReport } from "@/lib/llm/usage";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await getUsageReport();

  return NextResponse.json({
    provider: "deepseek",
    model: process.env.LLM_MODEL || "deepseek-chat",
    ...report,
    lowBalanceThresholdUsd: Number(
      process.env.DEEPSEEK_LOW_BALANCE_USD ?? 5
    ),
    reportIntervalUsd: 10,
  });
}
