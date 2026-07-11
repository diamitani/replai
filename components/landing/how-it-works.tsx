import { Brain, MessageSquare, Shield, Sparkles, UserCircle, Zap } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Write like you normally would",
    description:
      "Draft your message in a real chat. No special syntax, no prompts to memorize. Just type what you're actually thinking — typos, caps lock, and all.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Tap the sparkle button",
    description:
      "Before you send, hit AI Check. Replai reads your draft against rules you've set for that person — tone, timing, relationship context.",
  },
  {
    step: "03",
    icon: Brain,
    title: "Pick a rewrite (or don't)",
    description:
      "Get 2–3 options that say what you mean without the collateral damage. Edit any of them, send one, or ignore us and send as-is. Your call.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-600">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            A pause button for your thumbs
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">
            Not a filter that blocks you. A co-pilot that knows the difference between
            frustrated and starting a group-chat war.
          </p>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-[1.75rem] bg-brand-50/50 p-1.5 transition-shadow duration-500 ease-spring hover:shadow-brand"
            >
              <div className="h-full rounded-[calc(1.75rem-0.25rem)] bg-white p-6 ring-1 ring-brand-100/60">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <item.icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-2xl font-semibold tracking-tight text-brand-100">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-brand-200 bg-brand-50/50 p-8 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Why per-contact rules matter
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You don&apos;t text your boss like you text your best friend. Replai
                remembers that. Set tone notes, no-send windows, and relationship
                context once — and every rewrite gets smarter for that person.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: UserCircle, label: "Per-contact tone" },
                { icon: Shield, label: "No-send windows" },
                { icon: Zap, label: "Real-time chat" },
                { icon: Brain, label: "Context memory" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-brand-100"
                >
                  <item.icon className="size-5 shrink-0 text-brand-500" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
