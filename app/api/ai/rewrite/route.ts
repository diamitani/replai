import { createClient } from "@/lib/supabase/server";
import { rewriteMessage } from "@/lib/llm/rewrite";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { draft, contactRules, recentHistory } = await request.json();

    if (!draft || typeof draft !== "string") {
      return NextResponse.json({ error: "draft is required" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { options, usage } = await rewriteMessage(
      draft,
      contactRules ?? "",
      recentHistory ?? ""
    );

    return NextResponse.json({
      options,
      usage: {
        thisRequestCostUsd: usage.thisRequestCostUsd,
        totalSpentUsd: usage.totalSpentUsd,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        balanceUsd: usage.balanceUsd,
        milestoneReached: usage.milestoneReached,
        milestoneUsd: usage.milestoneUsd,
        lowBalance: usage.lowBalance,
        alerts: usage.alerts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
