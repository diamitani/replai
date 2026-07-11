"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

export function LandingNavbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 safe-top px-3 pt-3 sm:px-4">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-auto mx-auto flex h-14 max-w-3xl items-center justify-between rounded-full border border-white/60 bg-white/70 px-3 shadow-brand backdrop-blur-2xl sm:h-16 sm:px-4"
      >
        <Logo size="sm" />
        <nav className="hidden items-center gap-6 text-[13px] font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors duration-300 ease-spring hover:text-brand-700">
            How it works
          </a>
          <a href="#examples" className="transition-colors duration-300 ease-spring hover:text-brand-700">
            Examples
          </a>
          <a href="#features" className="transition-colors duration-300 ease-spring hover:text-brand-700">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden rounded-full px-3 text-[13px] sm:inline-flex"
            )}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "group pressable h-9 gap-1.5 rounded-full bg-brand-600 pl-3.5 pr-1.5 text-[13px] hover:bg-brand-700"
            )}
          >
            Get started
            <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </motion.header>
    </div>
  );
}
