import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Cta() {
  return (
    <section className="py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-1.5 shadow-brand-lg">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.25rem)] px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                Your future self will thank you
              </h2>
              <p className="mx-auto mt-5 max-w-[36ch] text-lg leading-relaxed text-blue-50/90">
                Never again wonder &ldquo;why did I send that?&rdquo; at 3am. Free to
                start. No judgment. Just better texts.
              </p>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group pressable mt-9 h-12 gap-2 rounded-full bg-white pl-5 pr-1.5 text-[15px] text-brand-700 hover:bg-blue-50"
                )}
              >
                Get started free
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-600/10 transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
