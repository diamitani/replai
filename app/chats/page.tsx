"use client";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ContactInviteWithUser,
  ConversationWithPreview,
  UserSearchResult,
} from "@/lib/types";
import {
  Check,
  Lock,
  MessageSquarePlus,
  Search,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

function displayLabel(user: {
  display_name?: string | null;
  username?: string | null;
  email?: string;
}) {
  return (
    user.display_name ??
    (user.username ? `@${user.username}` : null) ??
    user.email ??
    "Unknown"
  );
}

function initials(name?: string | null, fallback?: string) {
  return (name ?? fallback ?? "?").slice(0, 2).toUpperCase();
}

export default function ChatsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<ContactInviteWithUser[]>([]);
  const [outgoing, setOutgoing] = useState<ContactInviteWithUser[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/conversations");
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Failed to load conversations");
      return;
    }

    setConversations(data.conversations ?? []);
  }, []);

  const loadInvites = useCallback(async () => {
    const response = await fetch("/api/invites");
    if (!response.ok) return;
    const data = await response.json();
    setIncoming(data.incoming ?? []);
    setOutgoing(data.outgoing ?? []);
  }, []);

  useEffect(() => {
    void loadConversations();
    void loadInvites();
  }, [loadConversations, loadInvites]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(() => {
      void (async () => {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`
        );
        const data = await response.json();
        setSearching(false);
        if (response.ok) {
          setResults(data.users ?? []);
        }
      })();
    }, 250);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  const startChat = async (userId: string) => {
    setActionId(userId);
    setError(null);

    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientUserId: userId }),
    });
    const data = await response.json();
    setActionId(null);

    if (response.status === 403 && data.requiresInvite) {
      await sendInvite(userId);
      return;
    }

    if (!response.ok) {
      setError(data.error ?? "Failed to start chat");
      return;
    }

    setQuery("");
    setResults([]);
    router.push(`/chats/${data.conversation.id}`);
  };

  const sendInvite = async (userId: string) => {
    setActionId(userId);
    setError(null);

    const response = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: userId }),
    });
    const data = await response.json();
    setActionId(null);

    if (!response.ok) {
      setError(data.error ?? "Failed to send invite");
      return;
    }

    if (data.conversation?.id) {
      setQuery("");
      setResults([]);
      router.push(`/chats/${data.conversation.id}`);
      return;
    }

    if (data.alreadyConnected && data.conversationId) {
      router.push(`/chats/${data.conversationId}`);
      return;
    }

    setQuery("");
    setResults([]);
    await loadInvites();
  };

  const respondInvite = async (inviteId: string, action: "accept" | "decline") => {
    setActionId(inviteId);
    setError(null);

    const response = await fetch(`/api/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    setActionId(null);

    if (!response.ok) {
      setError(data.error ?? "Failed to update invite");
      return;
    }

    await loadInvites();
    if (action === "accept" && data.conversation?.id) {
      await loadConversations();
      router.push(`/chats/${data.conversation.id}`);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    setActionId(inviteId);
    await fetch(`/api/invites/${inviteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setActionId(null);
    await loadInvites();
  };

  const showSearch = query.trim().length > 0;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-[#F2F4F8]">
      <header className="ios-blur safe-top sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/chats" />
          <div className="hidden sm:block">
            <p className="text-[15px] font-semibold tracking-tight text-foreground">Messages</p>
            <p className="text-[11px] text-muted-foreground">AI guardrails on</p>
          </div>
        </div>
        <Link href="/settings">
          <Button
            variant="outline"
            size="sm"
            className="pressable rounded-full border-brand-100 text-brand-700 hover:bg-white"
          >
            <Settings className="size-4" strokeWidth={1.75} />
            Settings
          </Button>
        </Link>
      </header>

      <div className="border-b border-brand-100 bg-white px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or @username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-brand-200 pl-9 focus-visible:border-brand-400"
            autoComplete="off"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Open profiles show up by name. Private people need an exact @username
          or a contact invite.
        </p>
      </div>

      {error && (
        <p className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {incoming.length > 0 && (
        <section className="border-b border-brand-100 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            Message requests
          </p>
          <div className="space-y-2">
            {incoming.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-3 rounded-xl bg-brand-50/80 px-3 py-2.5"
              >
                <Avatar className="size-9 ring-2 ring-brand-100">
                  <AvatarFallback className="bg-gradient-brand text-xs font-semibold text-white">
                    {initials(
                      invite.other_user.display_name,
                      invite.other_user.username ?? undefined
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {displayLabel(invite.other_user)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invite.other_user.bio
                      ? invite.other_user.bio
                      : invite.other_user.username
                        ? `@${invite.other_user.username}`
                        : "Wants to message you"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={actionId === invite.id}
                  onClick={() => void respondInvite(invite.id, "accept")}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-200"
                  disabled={actionId === invite.id}
                  onClick={() => void respondInvite(invite.id, "decline")}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {outgoing.length > 0 && !showSearch && (
        <section className="border-b border-brand-100 bg-white/70 px-4 py-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Pending invites
          </p>
          <div className="space-y-2">
            {outgoing.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-3 rounded-xl px-1 py-1"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayLabel(invite.other_user)}
                  </p>
                  <p className="text-xs text-muted-foreground">Waiting for them to accept</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={actionId === invite.id}
                  onClick={() => void cancelInvite(invite.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex-1 overflow-y-auto">
        {showSearch ? (
          <div className="bg-white">
            {searching ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Searching...
              </p>
            ) : results.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-medium text-foreground">No one found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try an exact @username for private accounts, or ask them to
                  set their profile to open in Settings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-brand-100">
                {results.map((user) => {
                  const busy = actionId === user.id;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-3.5"
                    >
                      <Avatar className="size-11 ring-2 ring-brand-100">
                        <AvatarFallback className="bg-gradient-brand text-sm font-semibold text-white">
                          {initials(user.display_name, user.username ?? undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {displayLabel(user)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                          {user.username ? `@${user.username}` : "No username"}
                          {!user.is_discoverable && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-amber-700">
                              <Lock className="size-3" />
                              Private
                            </span>
                          )}
                        </p>
                        {user.bio && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      {user.is_discoverable ? (
                        <Button
                          size="sm"
                          className="bg-brand-600 hover:bg-brand-700"
                          disabled={busy}
                          onClick={() => void startChat(user.id)}
                        >
                          <MessageSquarePlus className="size-4" />
                          {busy ? "..." : "Message"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-brand-200 text-brand-700"
                          disabled={busy}
                          onClick={() => void sendInvite(user.id)}
                        >
                          <UserPlus className="size-4" />
                          {busy ? "..." : "Invite"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : loading ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
              <MessageSquarePlus className="size-7" />
            </div>
            <p className="text-lg font-semibold text-foreground">Message the world</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Search by name or @username. Add a short bio in Settings so people
              know who they&apos;re about to message.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-100 bg-white">
            {conversations.map((conversation) => {
              const stamp =
                conversation.last_message?.created_at ?? conversation.created_at;
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
                        conversation.other_user.username ??
                          conversation.other_user.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {displayLabel(conversation.other_user)}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatTime(stamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {conversation.last_message?.content ??
                        "No messages yet — say hello"}
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
