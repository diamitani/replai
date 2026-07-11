export type DeepSeekBalanceInfo = {
  currency: string;
  total_balance: string;
  granted_balance?: string;
  topped_up_balance?: string;
};

export type DeepSeekBalanceResponse = {
  is_available: boolean;
  balance_infos: DeepSeekBalanceInfo[];
};

export async function fetchDeepSeekBalance(): Promise<{
  balanceUsd: number | null;
  raw: DeepSeekBalanceResponse | null;
  error?: string;
}> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { balanceUsd: null, raw: null, error: "DEEPSEEK_API_KEY not set" };
  }

  try {
    const response = await fetch("https://api.deepseek.com/user/balance", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        balanceUsd: null,
        raw: null,
        error: `Balance API returned ${response.status}`,
      };
    }

    const raw = (await response.json()) as DeepSeekBalanceResponse;
    const usd = raw.balance_infos?.find(
      (info) => info.currency === "USD" || info.currency === "CNY"
    );

    const balanceUsd = usd ? Number.parseFloat(usd.total_balance) : null;

    return { balanceUsd, raw };
  } catch (error) {
    return {
      balanceUsd: null,
      raw: null,
      error: error instanceof Error ? error.message : "Balance fetch failed",
    };
  }
}
