"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { HeroChatDemo } from "./hero-chat-demo";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-gradient-brand-subtle grain pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="relative z-[2] mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="text-center lg:text-left">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mb-6 inline-flex items-center rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-700 shadow-sm"
            >
              Built for the pause before send
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[4rem]"
            >
              Think before you{" "}
              <em className="not-italic text-gradient-brand">send.</em>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
              className="mx-auto mt-6 max-w-[36ch] text-lg leading-relaxed text-muted-foreground lg:mx-0"
            >
              Draft the messy version. Replai rewrites it in your voice — with
              rules that know your boss isn&apos;t your group chat.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group pressable h-12 gap-2 rounded-full bg-brand-600 px-2 pl-5 text-[15px] shadow-brand hover:bg-brand-700"
                )}
              >
                Start free
                <span className="flex size-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "pressable h-12 rounded-full border-brand-200/80 bg-white/70 px-6 text-[15px] backdrop-blur-sm"
                )}
              >
                See how it works
              </a>
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="mt-7 text-sm text-muted-foreground"
            >
              Add to Home Screen · Feels like iMessage · No credit card
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="mx-auto w-full max-w-md lg:mx-0"
          >
            <div className="bezel">
              <div className="bezel-inner ring-1 ring-black/[0.03]">
                {/* iPhone status bar chrome */}
                <div className="flex items-center justify-between bg-brand-50/60 px-5 py-2.5 text-[11px] font-medium text-brand-800">
                  <span>9:41</span>
                  <span className="rounded-full bg-black/90 px-3 py-0.5 text-[9px] text-white">
                    Replai
                  </span>
                  <span className="tracking-tighter">■■■□</span>
                </div>
                <HeroChatDemo />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
