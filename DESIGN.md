# Replai Design System (taste-skill)

> Installed from `Leonxlnx/taste-skill`. Applied to all marketing + product UI.
> Skills live in `.cursor/skills/` — design-taste-frontend, redesign-existing-projects, high-end-visual-design.

## Design read

**Premium consumer messaging PWA for people who overthink texts.**  
Language: Apple-y / Soft Structuralism. Brand lock: white + electric blue.  
Bridge to native iOS: safe areas, squircles, Messages-native chat chrome, spring presses.

| Dial | Value |
|---|---|
| DESIGN_VARIANCE | 7 |
| MOTION_INTENSITY | 5 |
| VISUAL_DENSITY | 3 |

## Non-negotiables

- One accent: brand blue. No purple AI glow.
- Fonts: Outfit (display/UI) + Geist Mono (code/data). Never Inter/Roboto/Arial.
- `min-h-[100dvh]` not `h-screen`. Safe-area insets on app chrome.
- Animate only `transform` / `opacity`. Easing: `cubic-bezier(0.32, 0.72, 0, 1)`.
- Double-bezel on hero media / phone mockups. Floating island nav on marketing.
- Cards only when elevation aids hierarchy. Prefer spacing + tinted surfaces.
- Press feedback: `active:scale-[0.98]`. Hover: soft brand-tinted shadow lift.
- Chat UI mirrors iMessage: blue sent / soft gray received, large corner radius, blur headers.

## iOS bridge checklist

- [x] `apple-mobile-web-app-capable` + theme-color
- [x] Safe-area padding utilities (`.safe-top`, `.safe-bottom`)
- [x] PWA standalone display
- [ ] Native SwiftUI shell later — keep component names/tokens transferable

## When redesigning

1. Read `.cursor/skills/design-taste-frontend/SKILL.md`
2. Run redesign audit from `redesign-existing-projects`
3. Keep brand blue/white; upgrade rhythm, type, motion — don't invent a new palette
