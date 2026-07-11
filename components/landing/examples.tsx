import { X, Check, ArrowRight } from "lucide-react";

const examples = [
  {
    scenario: "The Friday meeting meltdown",
    before:
      "I can't believe you scheduled another meeting on Friday. This is ridiculous.",
    after:
      "Hey Sarah — Friday's already packed on my end. Could we move this to Monday?",
    why: "You were right to push back. You just didn't need to file a complaint with the universe.",
    emoji: "📅",
  },
  {
    scenario: "The 2am ex energy",
    before: "I saw you liked my friend's post. Are you trying to get my attention?",
    after: "Hey — hope you're doing well. No agenda, just wanted to say hi.",
    why: "Curiosity is human. Interrogation mode is... also human, but less advisable.",
    emoji: "🌙",
  },
  {
    scenario: "Mom's hourly check-ins",
    before: "I KNOW. I'll call you. Stop texting me every hour.",
    after: "Love you mom! Swamped today but I'll call you tonight around 7.",
    why: "She's not annoying. She's your mom with unlimited data and infinite love.",
    emoji: "💙",
  },
  {
    scenario: "Group chat FOMO spiral",
    before: "Wow so I guess nobody wants me there. Cool. Whatever.",
    after: "Hey! Didn't get the invite for Saturday — count me in if there's room!",
    why: "Passive-aggressive is a vibe. Direct and warm gets you invited next time.",
    emoji: "👋",
  },
];

export function Examples() {
  return (
    <section id="examples" className="bg-brand-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Relatable moments
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We&apos;ve all been the main character in these
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Same feelings. Better delivery. That&apos;s the whole game.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {examples.map((ex) => (
            <article
              key={ex.scenario}
              className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-brand"
            >
              <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="text-lg">{ex.emoji}</span>
                  {ex.scenario}
                </p>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-red-500">
                    <X className="size-3" /> What you almost sent
                  </p>
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-900/80 line-through decoration-red-300">
                    {ex.before}
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="size-5 rotate-90 text-brand-400 sm:rotate-0" />
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-600">
                    <Check className="size-3" /> What Replai suggested
                  </p>
                  <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-900">
                    {ex.after}
                  </p>
                </div>

                <p className="text-sm italic text-muted-foreground">{ex.why}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
