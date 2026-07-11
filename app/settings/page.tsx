"use client";

import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsageReport = {
  provider: string;
  model: string;
  totalSpentUsd: number;
  balanceUsd: number | null;
  balanceError?: string;
  lowBalance: boolean;
  lowBalanceThresholdUsd: number;
  nextMilestoneUsd: number;
  reportIntervalUsd: number;
  recentRequests: number;
};

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      const response = await fetch("/api/llm/usage");
      if (response.ok) {
        setUsage(await response.json());
      }
      setUsageLoading(false);
    };

    void load();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-gradient-brand-subtle px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/chats"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ChevronLeft className="size-4" />
          Messages
        </Link>
        <Logo size="sm" href="/chats" />
      </div>

      <Card className="border-brand-100 shadow-brand">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium text-foreground">{email ?? "..."}</p>
          </div>
          <Button
            variant="outline"
            className="border-brand-200 text-brand-700 hover:bg-brand-50"
            onClick={() => void handleSignOut()}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4 border-brand-100 shadow-brand">
        <CardHeader>
          <CardTitle>AI usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {usageLoading ? (
            <p className="text-muted-foreground">Loading usage...</p>
          ) : usage ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">
                  {usage.provider} / {usage.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account balance</span>
                <span className="font-medium">
                  {usage.balanceUsd !== null
                    ? `$${usage.balanceUsd.toFixed(2)}`
                    : (usage.balanceError ?? "Unavailable")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated spend (app)</span>
                <span className="font-medium">${usage.totalSpentUsd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI requests logged</span>
                <span className="font-medium">{usage.recentRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next usage report at</span>
                <span className="font-medium">${usage.nextMilestoneUsd}</span>
              </div>
              {usage.lowBalance && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                  Low balance: under ${usage.lowBalanceThresholdUsd}. Top up at
                  platform.deepseek.com
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                You get an in-app alert every ${usage.reportIntervalUsd} in estimated
                spend and when balance drops below ${usage.lowBalanceThresholdUsd}.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Could not load usage report.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
