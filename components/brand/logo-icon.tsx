import { cn } from "@/lib/utils";

type LogoIconProps = {
  className?: string;
  size?: number;
};

export function LogoIcon({ className, size = 40 }: LogoIconProps) {
  return (
    <svg
      role="img"
      aria-label="Replai"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="replai-grad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#replai-grad)" />
      <path
        d="M18 22C18 18.6863 20.6863 16 24 16H36C39.3137 16 42 18.6863 42 22V34C42 37.3137 39.3137 40 36 40H30L22 48V40H24C20.6863 40 18 37.3137 18 34V22Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M28 26H38M28 30H34"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="44" cy="44" r="10" fill="white" fillOpacity="0.95" />
      <path
        d="M40 44L43 47L49 41"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
