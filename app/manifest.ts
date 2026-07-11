import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReplyGuard AI",
    short_name: "ReplyGuard",
    description: "AI-assisted messaging with per-contact guardrails.",
    start_url: "/chats",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
