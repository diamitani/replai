import { X, Check, ArrowRight } from "lucide-react";

const examples = [
  {
    scenario: "The Friday meeting meltdown",
    before:
      "I can't believe you scheduled another meeting on Friday. This is ridiculous.",
    after:
      "Hey Sarah — Friday's already packed on my end. Could we move this to Monday?",
    why: "You were right to push back. You just didn't need to file a complaint with the universe.",
  },
  {
    scenario: "The 2am ex energy",
    before: "I saw you liked my friend's post. Are you trying to get my attention?",
    after: "Hey — hope you're doing well. No agenda, just wanted to say hi.",
    why: "Curiosity is human. Interrogation mode is also human — just less advisable.",
  },
  {
    scenario: "Mom's hourly check-ins",
    before: "I KNOW. I'll call you. Stop texting me every hour.",
    after: "Love you mom! Swamped today but I'll call you tonight around 7.",
    why: "She's not annoying. She's your mom with unlimited data and infinite love.",
  },
  {
    scenario: "Group chat FOMO spiral",
    before: "Wow so I guess nobody wants me there. Cool. Whatever.",
    after: "Hey! Didn't get the invite for Saturday — count me in if there's room!",
    why: "Passive-aggressive is a vibe. Direct and warm gets you invited next time.",
  },
];

export function Examples() {
  return (
    <section id="examples" className="bg-brand-50/40 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-600">
            Relatable moments
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
            We&apos;ve all been the main character in these
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Same feelings. Better delivery. That&apos;s the whole game.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {examples.map((ex) => (
            <article
              key={ex.scenario}
              className="overflow-hidden rounded-[1.75rem] bg-white p-1.5 shadow-sm ring-1 ring-brand-100/70 transition-shadow duration-500 ease-spring hover:shadow-brand"
            >
              <div className="rounded-[calc(1.75rem-0.25rem)] border border-brand-50 bg-white">
                <div className="border-b border-brand-50 px-5 py-3.5">
                  <p className="text-[13px] font-semibold tracking-tight text-foreground">
                    {ex.scenario}
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-red-500/80">
                      <X className="size-3" strokeWidth={2} /> What you almost sent
                    </p>
                    <p className="rounded-2xl bg-red-50/80 px-4 py-3 text-[14px] leading-relaxed text-red-900/70 line-through decoration-red-200">
                      {ex.before}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="size-4 rotate-90 text-brand-300 sm:rotate-0" />
                  </div>

                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-600">
                      <Check className="size-3" strokeWidth={2} /> What Replai suggested
                    </p>
                    <p className="rounded-2xl bg-brand-50 px-4 py-3 text-[14px] leading-relaxed text-brand-900">
                      {ex.after}
                    </p>
                  </div>

                  <p className="text-[13px] leading-relaxed text-muted-foreground">{ex.why}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
