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
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-100/60 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-brand-200/60 bg-white shadow-brand-lg">
        {/* Phone header */}
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
              {scenario.contact.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{scenario.contact}</p>
              <p className="text-xs text-brand-600">AI guardrails on</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-brand-100 hover:text-brand-700"
            aria-label="Reset demo"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-brand-50/30 px-4 py-4">
          {messages.length === 0 && phase === "idle" && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Type a message you&apos;re not sure about — then hit{" "}
              <Sparkles className="inline size-3.5 text-brand-500" /> Check.
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.isAi
                    ? "rounded-bl-md border border-brand-200 bg-brand-50 text-brand-900"
                    : msg.isOwn
                      ? "rounded-br-md bg-brand-500 text-white shadow-sm"
                      : "rounded-bl-md bg-zinc-100 text-zinc-900"
                )}
              >
                {msg.isAi && (
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                    <Sparkles className="size-3" /> Replai says
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {phase === "typing" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-brand-50 px-4 py-3 text-sm text-brand-600">
                <Loader2 className="size-4 animate-spin" />
                Reading the room...
              </div>
            </div>
          )}
          {phase === "options" && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-muted-foreground">Pick a rewrite:</p>
              {scenario.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendOption(option)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left text-sm leading-relaxed text-foreground transition-all hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {phase === "sent" && (
            <p className="text-center text-xs text-brand-600">
              Sent. No regrets. That&apos;s the whole point.
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="border-t border-brand-100 bg-white p-3">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write the text you're about to regret..."
              rows={2}
              disabled={phase === "typing"}
              className="flex-1 resize-none rounded-xl border border-brand-200 bg-brand-50/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
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
                className="size-9 bg-brand-500 hover:bg-brand-600"
                onClick={() => void runAiCheck()}
                disabled={!draft.trim() || phase === "typing"}
                aria-label="AI check"
              >
                <Sparkles className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-9 border-brand-200"
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
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {DEMO_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => loadScenario(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all",
              activeScenarioId === s.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
