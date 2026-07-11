import { Clock, MessageCircle, Shield, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI rewrite, not AI replacement",
    description:
      "We don't make you sound like a corporate chatbot. Replai keeps your voice — just the version of you that slept well and had breakfast.",
  },
  {
    icon: Users,
    title: "Rules per person",
    description:
      "Professional tone for your boss. Casual for your roommate. 'Don't text after 9pm' for your mom. Set it once, forget it forever.",
  },
  {
    icon: MessageCircle,
    title: "Real-time messaging",
    description:
      "Actual conversations with real people. iMessage-style bubbles, typing indicators, timestamps. It feels like texting because it is.",
  },
  {
    icon: Shield,
    title: "Send as-is, always",
    description:
      "Sometimes you need to say the thing. We give you options — you're still the one who hits send. No nanny mode.",
  },
  {
    icon: Clock,
    title: "Timing awareness",
    description:
      "Late-night drafts hit different. Replai can flag messages that read differently at 11pm than they would at 11am.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-600">
            Features
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            Built for humans who overthink
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Everything you need to send the right message — without losing what you
            actually wanted to say.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-brand-100 p-6 transition-all hover:border-brand-200 hover:shadow-brand"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
