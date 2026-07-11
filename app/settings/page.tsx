"use client";

import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/lib/types";
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

const BIO_MAX = 160;

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      const [profileRes, usageRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/llm/usage"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        const p = data.profile as User;
        setProfile(p);
        setDisplayName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setIsDiscoverable(p.is_discoverable ?? true);
      }

      if (usageRes.ok) {
        setUsage(await usageRes.json());
      }
      setUsageLoading(false);
    };

    void load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError(null);
    setProfileSaved(false);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName,
        username: username.trim() === "" ? null : username,
        bio: bio.trim() === "" ? null : bio,
        is_discoverable: isDiscoverable,
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setProfileError(data.error ?? "Failed to save profile");
      return;
    }

    setProfile(data.profile);
    setUsername(data.profile.username ?? "");
    setDisplayName(data.profile.display_name ?? "");
    setBio(data.profile.bio ?? "");
    setIsDiscoverable(data.profile.is_discoverable);
    setProfileSaved(true);
  };

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
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium text-foreground">{email ?? "..."}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you appear in chats"
                className="border-brand-200"
                maxLength={80}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  placeholder="yourname"
                  className="border-brand-200 pl-7"
                  maxLength={30}
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                3–30 characters. Letters, numbers, underscores. Others can find
                you with @{username || "username"} even if you&apos;re private.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                placeholder="A short line for people who want to message you"
                className="min-h-20 border-brand-200"
                maxLength={BIO_MAX}
              />
              <p className="text-xs text-muted-foreground">
                Shown in search before someone hits Message. {bio.length}/{BIO_MAX}
              </p>
            </div>

            <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDiscoverable}
                  onChange={(e) => setIsDiscoverable(e.target.checked)}
                  className="mt-1 size-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Open to search
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {isDiscoverable
                      ? "People can find you by display name in search."
                      : "Private — only exact @username or an invite can reach you."}
                  </span>
                </span>
              </label>
            </div>

            {profileError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {profileError}
              </p>
            )}
            {profileSaved && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Profile saved
                {profile?.username ? ` — share @${profile.username}` : ""}.
              </p>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4 border-brand-100 shadow-brand">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
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
