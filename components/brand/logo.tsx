import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoIcon } from "./logo-icon";

type LogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
};

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 44, text: "text-2xl" },
};

export function Logo({ className, showText = true, size = "md", href = "/" }: LogoProps) {
  const { icon, text } = sizes[size];

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={icon} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          Repl<span className="text-brand-600">ai</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
