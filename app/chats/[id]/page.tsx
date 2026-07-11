"use client";

import { AdvancedAiChatInput } from "@/components/ui/advanced-ai-chat-input";
import { AiChatOptions } from "@/components/ui/ai-chat";
import { ChatInterface, type ChatMessage } from "@/components/ui/chat-interface";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { buildContactRules } from "@/lib/conversations";
import { createClient } from "@/lib/supabase/client";
import type { Contact, Message } from "@/lib/types";
import { ChevronLeft, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>("Contact");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOptions, setAiOptions] = useState<string[] | null>(null);
  const [originalDraft, setOriginalDraft] = useState("");
  const [usageAlert, setUsageAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapMessage = useCallback(
    (message: Message, userId: string): ChatMessage => ({
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      createdAt: message.created_at,
      isOwn: message.sender_id === userId,
    }),
    []
  );

  const loadThread = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      setError("Conversation not found");
      setLoading(false);
      return;
    }

    const otherUserId =
      conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

    const [{ data: otherUser }, { data: messageRows }, contactResponse] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, display_name, username")
        .eq("id", otherUserId)
        .single(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
      fetch(`/api/contacts/${conversationId}`),
    ]);

    if (otherUser) {
      const label =
        otherUser.display_name ??
        (otherUser.username ? `@${otherUser.username}` : otherUser.email);
      setRecipientName(label);
    }

    if (messageRows) {
      setMessages(messageRows.map((message) => mapMessage(message, user.id)));
    }

    if (contactResponse.ok) {
      const contactData = await contactResponse.json();
      setContact(contactData.contact ?? null);
    }

    setLoading(false);
  }, [conversationId, mapMessage, supabase]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((message) => message.id === newMessage.id)) {
              return prev;
            }
            return [...prev, mapMessage(newMessage, currentUserId)];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, mapMessage, supabase]);

  const sendMessage = async (
    content: string,
    aiOriginalDraftValue?: string,
    aiWasRewritten = false
  ) => {
    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        content,
        aiOriginalDraft: aiOriginalDraftValue,
        aiWasRewritten,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to send message");
      return;
    }

    if (currentUserId) {
      setMessages((prev) => {
        if (prev.some((message) => message.id === data.message.id)) {
          return prev;
        }
        return [...prev, mapMessage(data.message, currentUserId)];
      });
    }
  };

  const handleAiCheck = async (draft: string) => {
    setAiLoading(true);
    setError(null);
    setOriginalDraft(draft);

    const recentHistory = messages
      .slice(-8)
      .map((message) => `${message.isOwn ? "You" : recipientName}: ${message.content}`)
      .join("\n");

    const response = await fetch("/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft,
        contactRules: contact ? buildContactRules(contact) : "",
        recentHistory,
      }),
    });

    const data = await response.json();
    setAiLoading(false);

    if (!response.ok) {
      setError(data.error ?? "AI rewrite failed");
      return;
    }

    if (data.usage?.alerts?.length) {
      setUsageAlert(data.usage.alerts.join(" "));
    }

    setAiOptions(data.options);
  };

  const handleOptionSelect = async (option: string, wasRewritten: boolean) => {
    setAiOptions(null);
    await sendMessage(option, wasRewritten ? originalDraft : undefined, wasRewritten);
    setOriginalDraft("");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-brand-subtle p-8 text-sm text-muted-foreground">
        Loading chat...
      </main>
    );
  }

  if (error && !currentUserId) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-red-600">
        {error}
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-white">
      <header className="flex items-center justify-between border-b border-brand-100 bg-white/95 px-3 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/chats"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-50"
            aria-label="Back to messages"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Avatar className="size-9 shrink-0 ring-2 ring-brand-100">
            <AvatarFallback className="bg-gradient-brand text-xs font-semibold text-white">
              {recipientName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground">
              {recipientName}
            </h1>
            <p className="text-[11px] text-brand-600">AI guardrails on</p>
          </div>
        </div>
        <Link href={`/chats/${conversationId}/profile`}>
          <Button
            variant="outline"
            size="sm"
            className="border-brand-200 text-brand-700 hover:bg-brand-50"
          >
            <UserRound className="size-4" />
            Rules
          </Button>
        </Link>
      </header>

      {error && (
        <p className="mx-3 mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {usageAlert && (
        <p className="mx-3 mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {usageAlert}
        </p>
      )}

      <ChatInterface
        messages={messages}
        currentUserId={currentUserId ?? ""}
        recipientName={recipientName}
        className="flex-1 bg-gradient-to-b from-white to-brand-50/40"
      />

      {aiOptions ? (
        <AiChatOptions
          options={aiOptions}
          originalDraft={originalDraft}
          onSelect={(option, wasRewritten) => void handleOptionSelect(option, wasRewritten)}
          onClose={() => setAiOptions(null)}
        />
      ) : (
        <AdvancedAiChatInput
          onSend={(message) => void sendMessage(message)}
          onAiCheck={(draft) => void handleAiCheck(draft)}
          aiLoading={aiLoading}
          placeholder="Write a text — then tap the sparkle"
        />
      )}
    </main>
  );
}
