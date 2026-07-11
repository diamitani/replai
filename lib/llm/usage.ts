import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { fetchDeepSeekBalance } from "./deepseek";
import {
  DEFAULT_LOW_BALANCE_USD,
  USAGE_REPORT_INTERVAL_USD,
  estimateDeepSeekCostUsd,
} from "./pricing";

export type UsageRecordResult = {
  thisRequestCostUsd: number;
  totalSpentUsd: number;
  promptTokens: number;
  completionTokens: number;
  milestoneReached: boolean;
  milestoneUsd: number | null;
  lowBalance: boolean;
  balanceUsd: number | null;
  alerts: string[];
};

type UsageState = {
  totalSpentUsd: number;
  lastReportedThresholdUsd: number;
  lowBalanceAlerted: boolean;
};

const STATE_FILE = path.join(process.cwd(), ".data", "llm-usage-state.json");

async function readFileState(): Promise<UsageState> {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw) as UsageState;
  } catch {
    return {
      totalSpentUsd: 0,
      lastReportedThresholdUsd: 0,
      lowBalanceAlerted: false,
    };
  }
}

async function writeFileState(state: UsageState) {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

async function recordViaSupabase(
  promptTokens: number,
  completionTokens: number,
  costUsd: number
): Promise<UsageRecordResult | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("record_llm_usage", {
      p_prompt_tokens: promptTokens,
      p_completion_tokens: completionTokens,
      p_estimated_cost_usd: costUsd,
    });

    if (error || !data) return null;

    const balance = await fetchDeepSeekBalance();
    const lowThreshold = Number(
      process.env.DEEPSEEK_LOW_BALANCE_USD ?? DEFAULT_LOW_BALANCE_USD
    );
    const alerts: string[] = [];

    if (data.milestone_reached) {
      alerts.push(
        `Usage report: $${data.milestone_usd} in estimated API spend reached (total ~$${Number(data.total_spent_usd).toFixed(2)}).`
      );
    }

    const lowBalance =
      balance.balanceUsd !== null && balance.balanceUsd <= lowThreshold;

    if (lowBalance) {
      alerts.push(
        `Low DeepSeek balance: $${balance.balanceUsd?.toFixed(2)} remaining. Top up at platform.deepseek.com.`
      );
    }

    return {
      thisRequestCostUsd: costUsd,
      totalSpentUsd: Number(data.total_spent_usd),
      promptTokens,
      completionTokens,
      milestoneReached: Boolean(data.milestone_reached),
      milestoneUsd: data.milestone_usd ? Number(data.milestone_usd) : null,
      lowBalance,
      balanceUsd: balance.balanceUsd,
      alerts,
    };
  } catch {
    return null;
  }
}

async function recordViaFile(
  promptTokens: number,
  completionTokens: number,
  costUsd: number
): Promise<UsageRecordResult> {
  const state = await readFileState();
  state.totalSpentUsd = Number((state.totalSpentUsd + costUsd).toFixed(6));

  const alerts: string[] = [];
  let milestoneReached = false;
  let milestoneUsd: number | null = null;

  const nextThreshold =
    Math.floor(state.totalSpentUsd / USAGE_REPORT_INTERVAL_USD) *
    USAGE_REPORT_INTERVAL_USD;

  if (
    nextThreshold > state.lastReportedThresholdUsd &&
    nextThreshold >= USAGE_REPORT_INTERVAL_USD
  ) {
    milestoneReached = true;
    milestoneUsd = nextThreshold;
    state.lastReportedThresholdUsd = nextThreshold;
    alerts.push(
      `Usage report: $${nextThreshold} in estimated API spend reached (total ~$${state.totalSpentUsd.toFixed(2)}).`
    );
  }

  const balance = await fetchDeepSeekBalance();
  const lowThreshold = Number(
    process.env.DEEPSEEK_LOW_BALANCE_USD ?? DEFAULT_LOW_BALANCE_USD
  );
  const lowBalance =
    balance.balanceUsd !== null && balance.balanceUsd <= lowThreshold;

  if (lowBalance && !state.lowBalanceAlerted) {
    state.lowBalanceAlerted = true;
    alerts.push(
      `Low DeepSeek balance: $${balance.balanceUsd?.toFixed(2)} remaining. Top up at platform.deepseek.com.`
    );
  } else if (balance.balanceUsd !== null && balance.balanceUsd > lowThreshold) {
    state.lowBalanceAlerted = false;
  }

  await writeFileState(state);

  return {
    thisRequestCostUsd: costUsd,
    totalSpentUsd: state.totalSpentUsd,
    promptTokens,
    completionTokens,
    milestoneReached,
    milestoneUsd,
    lowBalance,
    balanceUsd: balance.balanceUsd,
    alerts,
  };
}

export async function recordUsage(
  promptTokens: number,
  completionTokens: number
): Promise<UsageRecordResult> {
  const costUsd = estimateDeepSeekCostUsd(promptTokens, completionTokens);
  const fromDb = await recordViaSupabase(promptTokens, completionTokens, costUsd);
  if (fromDb) return fromDb;
  return recordViaFile(promptTokens, completionTokens, costUsd);
}

export async function getUsageReport(): Promise<{
  totalSpentUsd: number;
  balanceUsd: number | null;
  balanceError?: string;
  lowBalance: boolean;
  nextMilestoneUsd: number;
  recentRequests: number;
}> {
  const balance = await fetchDeepSeekBalance();
  const lowThreshold = Number(
    process.env.DEEPSEEK_LOW_BALANCE_USD ?? DEFAULT_LOW_BALANCE_USD
  );

  let totalSpentUsd = 0;
  let recentRequests = 0;

  try {
    const supabase = await createClient();
    const { data: state } = await supabase
      .from("llm_usage_state")
      .select("total_spent_usd")
      .eq("id", 1)
      .maybeSingle();

    if (state) {
      totalSpentUsd = Number(state.total_spent_usd);
    }

    const { count } = await supabase
      .from("llm_usage")
      .select("*", { count: "exact", head: true });

    recentRequests = count ?? 0;
  } catch {
    const fileState = await readFileState();
    totalSpentUsd = fileState.totalSpentUsd;
  }

  const nextMilestoneUsd =
    (Math.floor(totalSpentUsd / USAGE_REPORT_INTERVAL_USD) + 1) *
    USAGE_REPORT_INTERVAL_USD;

  return {
    totalSpentUsd,
    balanceUsd: balance.balanceUsd,
    balanceError: balance.error,
    lowBalance:
      balance.balanceUsd !== null && balance.balanceUsd <= lowThreshold,
    nextMilestoneUsd,
    recentRequests,
  };
}
