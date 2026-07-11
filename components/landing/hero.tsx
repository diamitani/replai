import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HeroChatDemo } from "./hero-chat-demo";
import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-brand-subtle pt-12 pb-20 sm:pt-16 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 size-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-24 left-0 size-80 rounded-full bg-brand-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm text-brand-700 shadow-sm">
              <MessageCircle className="size-4 text-brand-500" />
              Your co-pilot before you hit send
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Think before you{" "}
              <span className="text-gradient-brand">send.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0 mx-auto">
              Replai is the messaging app for people who&apos;ve typed something,
              stared at it for 47 seconds, and still hit send anyway. We rewrite
              your draft — in your voice — before it becomes someone else&apos;s
              problem.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 bg-brand-600 px-6 hover:bg-brand-700"
                )}
              >
                Start messaging smarter
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 border-brand-200"
                )}
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Free to try · No credit card · Works on any device
            </p>
          </div>

          <div className="lg:pl-4">
            <HeroChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
