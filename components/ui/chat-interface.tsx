"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isOwn: boolean;
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Say hello to {recipientName ?? "your contact"}.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
                message.isOwn
                  ? "rounded-br-md bg-brand-500 text-white"
                  : "rounded-bl-md bg-zinc-100 text-zinc-900 ring-1 ring-brand-100/60"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  message.isOwn ? "text-brand-100" : "text-zinc-500"
                )}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-zinc-200 px-4 py-3 text-sm text-zinc-500">
              typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
