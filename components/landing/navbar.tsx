import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size="sm" />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-brand-600">
            How it works
          </a>
          <a href="#examples" className="transition-colors hover:text-brand-600">
            Examples
          </a>
          <a href="#features" className="transition-colors hover:text-brand-600">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "sm" }), "bg-brand-600 hover:bg-brand-700")}
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}
