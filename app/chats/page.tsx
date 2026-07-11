"use client";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConversationWithPreview } from "@/lib/types";
import { MessageSquarePlus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    const response = await fetch("/api/conversations");
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to load conversations");
      return;
    }

    setConversations(data.conversations ?? []);
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail }),
    });

    const data = await response.json();
    setCreating(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to create conversation");
      return;
    }

    setRecipientEmail("");
    router.push(`/chats/${data.conversation.id}`);
  };

  const initials = (name?: string | null, email?: string) =>
    (name ?? email ?? "?").slice(0, 2).toUpperCase();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-gradient-brand-subtle">
      <header className="flex items-center justify-between border-b border-brand-100 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/chats" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Messages</p>
            <p className="text-xs text-muted-foreground">AI guardrails on</p>
          </div>
        </div>
        <Link href="/settings">
          <Button
            variant="outline"
            size="sm"
            className="border-brand-200 text-brand-700 hover:bg-brand-50"
          >
            <Settings className="size-4" />
            Settings
          </Button>
        </Link>
      </header>

      <div className="border-b border-brand-100 bg-white px-4 py-3">
        <form onSubmit={(e) => void handleCreateConversation(e)} className="flex gap-2">
          <Input
            type="email"
            placeholder="Start chat by email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            className="border-brand-200 focus-visible:border-brand-400"
          />
          <Button
            type="submit"
            disabled={creating}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <MessageSquarePlus className="size-4" />
            {creating ? "..." : "Start"}
          </Button>
        </form>
      </div>

      {error && (
        <p className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
              <MessageSquarePlus className="size-7" />
            </div>
            <p className="text-lg font-semibold text-foreground">Start a conversation</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enter someone&apos;s email above. They need a Replai account first —
              then you can message with AI rewrites before you send.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-100 bg-white">
            {conversations.map((conversation) => {
              const stamp = conversation.last_message?.created_at ?? conversation.created_at;
              return (
                <Link
                  key={conversation.id}
                  href={`/chats/${conversation.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/60"
                >
                  <Avatar className="size-11 ring-2 ring-brand-100">
                    <AvatarFallback className="bg-gradient-brand text-sm font-semibold text-white">
                      {initials(
                        conversation.other_user.display_name,
                        conversation.other_user.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {conversation.other_user.display_name ??
                          conversation.other_user.email}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatTime(stamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {conversation.last_message?.content ?? "No messages yet — say hello"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
