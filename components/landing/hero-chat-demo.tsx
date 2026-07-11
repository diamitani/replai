"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_SCENARIOS, matchScenario, type DemoScenario } from "@/lib/demo-rewrites";
import { Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type DemoMessage = {
  id: string;
  content: string;
  isOwn: boolean;
  isAi?: boolean;
};

type DemoPhase = "idle" | "typing" | "insight" | "options" | "sent";

export function HeroChatDemo() {
  const [draft, setDraft] = useState(DEMO_SCENARIOS[0].draft);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [scenario, setScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [activeScenarioId, setActiveScenarioId] = useState("boss");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, phase, scrollToBottom]);

  const reset = () => {
    setMessages([]);
    setPhase("idle");
  };

  const loadScenario = (s: DemoScenario) => {
    setActiveScenarioId(s.id);
    setScenario(s);
    setDraft(s.draft);
    reset();
  };

  const runAiCheck = async () => {
    if (!draft.trim() || phase === "typing") return;

    const matched = matchScenario(draft);
    setScenario(matched);
    setPhase("typing");

    await new Promise((r) => setTimeout(r, 900));

    setMessages([
      {
        id: "insight",
        content: matched.insight,
        isOwn: false,
        isAi: true,
      },
    ]);
    setPhase("insight");

    await new Promise((r) => setTimeout(r, 600));
    setPhase("options");
  };

  const sendOption = (text: string) => {
    setMessages((prev) => [
      ...prev.filter((m) => !m.isAi || m.id === "insight"),
      { id: `sent-${Date.now()}`, content: text, isOwn: true },
    ]);
    setPhase("sent");
    setDraft("");
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-white">
        {/* Phone header */}
        <div className="flex items-center justify-between border-b border-brand-100/80 bg-white/90 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[22%] bg-gradient-brand text-sm font-semibold text-white shadow-sm">
              {scenario.contact.charAt(0)}
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                {scenario.contact}
              </p>
              <p className="text-[11px] font-medium text-brand-600">AI guardrails on</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="pressable rounded-full p-2 text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            aria-label="Reset demo"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 space-y-2.5 overflow-y-auto bg-[#F2F4F8] px-3 py-4">
          {messages.length === 0 && phase === "idle" && (
            <p className="px-4 py-10 text-center text-[13px] leading-relaxed text-muted-foreground">
              Type a message you&apos;re not sure about — then tap{" "}
              <Sparkles className="inline size-3.5 text-brand-500" /> Check.
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2 text-[15px] leading-snug",
                  msg.isAi
                    ? "rounded-[1.15rem] rounded-bl-md border border-brand-200/80 bg-white text-brand-900 shadow-sm"
                    : msg.isOwn
                      ? "rounded-[1.15rem] rounded-br-sm bg-[#0A84FF] text-white"
                      : "rounded-[1.15rem] rounded-bl-sm bg-white text-zinc-900 shadow-sm"
                )}
              >
                {msg.isAi && (
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-600">
                    <Sparkles className="size-3" /> Replai
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {phase === "typing" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[1.15rem] rounded-bl-sm bg-white px-4 py-3 text-[13px] text-brand-600 shadow-sm">
                <Loader2 className="size-4 animate-spin" />
                Reading the room...
              </div>
            </div>
          )}
          {phase === "options" && (
            <div className="space-y-2 pt-1">
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Pick a rewrite
              </p>
              {scenario.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendOption(option)}
                  className="pressable w-full rounded-2xl border border-brand-100 bg-white px-3.5 py-2.5 text-left text-[14px] leading-relaxed text-foreground shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {phase === "sent" && (
            <p className="text-center text-[12px] font-medium text-brand-600">
              Sent. No regrets.
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="border-t border-brand-100/80 bg-white p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write the text you're about to regret..."
              rows={2}
              disabled={phase === "typing"}
              className="flex-1 resize-none rounded-[1.25rem] border border-brand-100 bg-[#F2F4F8] px-3.5 py-2.5 text-[15px] outline-none transition-shadow placeholder:text-muted-foreground focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void runAiCheck();
                }
              }}
            />
            <div className="flex flex-col gap-1.5">
              <Button
                size="icon"
                className="pressable size-10 rounded-full bg-[#0A84FF] hover:bg-brand-600"
                onClick={() => void runAiCheck()}
                disabled={!draft.trim() || phase === "typing"}
                aria-label="AI check"
              >
                <Sparkles className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-10 rounded-full border-brand-100"
                disabled
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario pills */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {DEMO_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => loadScenario(s)}
            className={cn(
              "pressable rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-300 ease-spring",
              activeScenarioId === s.id
                ? "bg-brand-600 text-white shadow-brand"
                : "bg-white/80 text-brand-700 ring-1 ring-brand-200/80 hover:bg-brand-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
