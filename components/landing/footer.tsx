import { Logo } from "@/components/brand/logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="sm" href="/" />
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-brand-600">
              How it works
            </a>
            <a href="#examples" className="hover:text-brand-600">
              Examples
            </a>
            <a href="#features" className="hover:text-brand-600">
              Features
            </a>
            <Link href="/login" className="hover:text-brand-600">
              Log in
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Replai. Think before you send.
        </p>
      </div>
    </footer>
  );
}
