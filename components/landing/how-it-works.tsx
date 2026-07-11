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
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A pause button for your thumbs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Not a filter that blocks you. Not a robot that sounds like a LinkedIn post.
            A co-pilot that knows the difference between &ldquo;I&apos;m frustrated&rdquo; and
            &ldquo;I&apos;m about to start a group chat war.&rdquo;
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-brand-100 bg-gradient-to-b from-white to-brand-50/30 p-6 transition-shadow hover:shadow-brand"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <item.icon className="size-5" />
                </div>
                <span className="text-3xl font-bold text-brand-100">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
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
