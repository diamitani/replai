"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isOwn: boolean;
  aiWasRewritten?: boolean;
  /** Private original — only present if caller is allowed to see it */
  originalDraft?: string | null;
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  currentUserId: string;
  recipientName?: string;
  isTyping?: boolean;
  className?: string;
};

export function ChatInterface({
  messages,
  recipientName,
  isTyping,
  className,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden bg-[#F2F4F8]", className)}>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="px-6 py-16 text-center text-[13px] leading-relaxed text-muted-foreground">
            No messages yet. Say hello to {recipientName ?? "your contact"}.
          </p>
        )}
        {messages.map((message) => {
          const hasOriginal =
            Boolean(message.originalDraft) &&
            message.originalDraft !== message.content;
          const isExpanded = expandedId === message.id;

          return (
            <div
              key={message.id}
              className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] px-3.5 py-2 text-[15px] leading-snug shadow-sm",
                  message.isOwn
                    ? "rounded-[1.15rem] rounded-br-sm bg-[#0A84FF] text-white"
                    : "rounded-[1.15rem] rounded-bl-sm bg-white text-zinc-900 ring-1 ring-black/[0.04]"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                {hasOriginal && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : message.id)
                      }
                      className={cn(
                        "text-[11px] font-medium underline-offset-2 hover:underline",
                        message.isOwn ? "text-white/80" : "text-brand-600"
                      )}
                    >
                      {isExpanded
                        ? "Hide original"
                        : message.isOwn
                          ? "What I really typed"
                          : "What they really typed"}
                    </button>
                    {isExpanded && (
                      <p
                        className={cn(
                          "mt-1.5 rounded-xl px-2.5 py-1.5 text-xs leading-relaxed",
                          message.isOwn
                            ? "bg-black/15 text-white/90"
                            : "bg-[#F2F4F8] text-zinc-600"
                        )}
                      >
                        {message.originalDraft}
                      </p>
                    )}
                  </div>
                )}

                <p
                  className={cn(
                    "mt-1 text-[10px] tabular-nums",
                    message.isOwn ? "text-white/70" : "text-zinc-400"
                  )}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {message.aiWasRewritten && !hasOriginal && message.isOwn
                    ? " · AI"
                    : null}
                </p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-[1.15rem] rounded-bl-sm bg-white px-4 py-3 text-[13px] text-zinc-400 shadow-sm">
              typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
