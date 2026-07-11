"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";

type AdvancedAiChatInputProps = {
  onSend: (message: string) => void | Promise<void>;
  onAiCheck?: (draft: string) => void | Promise<void>;
  disabled?: boolean;
  aiLoading?: boolean;
  placeholder?: string;
  className?: string;
};

export function AdvancedAiChatInput({
  onSend,
  onAiCheck,
  disabled,
  aiLoading,
  placeholder = "Type a message...",
  className,
}: AdvancedAiChatInputProps) {
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    await onSend(trimmed);
    setDraft("");
  };

  const handleAiCheck = async () => {
    const trimmed = draft.trim();
    if (!trimmed || disabled || !onAiCheck) return;
    await onAiCheck(trimmed);
  };

  return (
    <div className={cn("border-t border-brand-100/80 bg-white/90 px-3 py-2.5 safe-bottom backdrop-blur-xl", className)}>
      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none rounded-[1.25rem] border-brand-100 bg-[#F2F4F8] px-3.5 text-[15px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        {onAiCheck && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="pressable h-11 w-11 shrink-0 rounded-full border-brand-100 text-brand-600 hover:bg-brand-50"
            onClick={() => void handleAiCheck()}
            disabled={disabled || aiLoading || !draft.trim()}
            aria-label="AI check"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          className="pressable h-11 w-11 shrink-0 rounded-full bg-[#0A84FF] hover:bg-brand-600"
          onClick={() => void handleSend()}
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
