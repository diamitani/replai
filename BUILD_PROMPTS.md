# ReplyGuard AI — Build Prompts (Cursor / Antigravity)

FPE: one prompt per step, review the diff, commit, move to the next. Don't skip ahead.

## Setup (do this first, before any prompt)

1. Create the repo, drop `PRD.md` and `BUILD_PLAN.md` into the project root
2. Open the repo in Cursor or Antigravity
3. Paste **Prompt 0** into agent/composer mode
4. Then paste Prompts 1 → 9 in order, one per turn, waiting for each to finish and pass its acceptance check before the next

Every prompt below assumes the agent can read `PRD.md` and `BUILD_PLAN.md` from the repo root. If your tool can't read local files automatically, paste the relevant PRD/BUILD_PLAN section into the prompt first.

---

## Prompt 0 — Project kickoff (paste once, first)

```
Read PRD.md and BUILD_PLAN.md in this repo root before doing anything else.

This is ReplyGuard AI — a real-time 1:1 chat app with an AI compose layer that
rewrites drafts before sending, based on per-contact rules. Full spec is in
PRD.md, build order is in BUILD_PLAN.md.

Locked constraints, do not deviate without asking me first:
- Stack: Next.js 15 + TypeScript + Tailwind, Supabase (auth/db/realtime),
  Vercel AI SDK for the LLM layer (OpenRouter default, Bedrock as a swappable
  second provider), shadcn/ui + 21st.dev components for UI.
- MVP scope is PRD.md section 4 ONLY. Anything not listed there — including
  analytics, group chats, push notifications, native iOS, real SMS — goes in
  a v1.1 list you keep in NOTES.md. Do not build it now even if it seems easy.
- Build in the exact step order in BUILD_PLAN.md. Do not jump ahead to a later
  step or combine steps.
- After each step: run the app, confirm it doesn't break, tell me what to
  manually test, then stop and wait for me before continuing.
- Use the exact database schema, API routes, and code patterns given in
  PRD.md and BUILD_PLAN.md — don't redesign them.

Confirm you've read both files and summarize the 8 build steps back to me in
one short list before starting Step 1.
```

---

## Prompt 1 — Step 1: Repo scaffold + 21st.dev components

```
Execute BUILD_PLAN.md Step 1 exactly: scaffold the Next.js app, init shadcn,
install the three 21st.dev components (chat-interface, advanced-ai-chat-input,
ai-chat) and the Supabase + Vercel AI SDK packages listed. Commit with message
"init: scaffold + ui components".

Acceptance check: `npm run dev` runs with no errors, the installed components
exist under components/ui/.
```

---

## Prompt 2 — Step 2: Supabase schema + realtime

```
Execute BUILD_PLAN.md Step 2. Use the exact schema from PRD.md section 6 —
users, contacts, conversations, messages tables, RLS enabled on all four.
Enable Realtime replication on the messages table. Create lib/supabase/client.ts
and lib/supabase/server.ts using @supabase/ssr per the standard Next.js 15
App Router pattern.

Ask me for my Supabase project URL and anon key if they're not already in
.env.local — don't invent placeholder values that look real.

Acceptance check: a test query against the users table succeeds from a
server component.
```

---

## Prompt 3 — Step 3: Auth (email magic link)

```
Execute BUILD_PLAN.md Step 3. Email magic link only via Supabase Auth — no
phone auth, no Apple Sign In, no password flow. Build app/(auth)/login/page.tsx
with an email input and "send magic link" button. Protect /chats so it
redirects to /login when there's no session.

Acceptance check: I can sign up with a real email, click the magic link, and
land on /chats.
```

---

## Prompt 4 — Step 4: Conversation list

```
Execute BUILD_PLAN.md Step 4. Build /chats: list conversations for the
current user with most recent message preview, empty state "Start a
conversation" when there are none. Protected route.

Acceptance check: with zero conversations in the db, the empty state shows;
with one seeded conversation, it lists correctly.
```

---

## Prompt 5 — Step 5: Thread view + realtime delivery

```
Execute BUILD_PLAN.md Step 5. Build /chats/[id] using the installed
chat-interface component for the bubble layout (sender right/blue, recipient
left/gray) and the advanced-ai-chat-input component for the compose bar.
Subscribe to the Supabase Realtime channel for this conversation so new
messages appear instantly without a refresh. Don't wire the AI rewrite button
yet — plain send only for now.

Acceptance check: open the same conversation in two browser windows signed in
as two different test users, send from one, confirm it appears in the other
within ~1 second with no refresh.
```

---

## Prompt 6 — Step 6: AI compose layer (Vercel AI SDK)

```
Execute BUILD_PLAN.md Step 6 exactly as specified — lib/llm/models.ts with
getModel() switching between the OpenRouter and Bedrock providers via the
LLM_MODEL env var, lib/llm/rewrite.ts using generateObject with the Zod
schema for exactly 3 options, and app/api/ai/rewrite/route.ts calling it.

Wire the "AI check" button in the compose bar (from the advanced-ai-chat-input
component) to call this route and show the 3 returned options using the
ai-chat component's option-picker pattern, plus a "send as-is" option and an
inline edit option. Store ai_original_draft and set ai_was_rewritten on the
message row whenever a rewritten option is chosen instead of the original.

Ask me for OPENROUTER_API_KEY if it's not in .env.local yet.

Acceptance check: typing a draft and tapping "AI check" returns 3 distinct
rewritten options within a few seconds, and choosing one sends it and shows
up in the other test window.
```

---

## Prompt 7 — Step 7: Contact profile + rules

```
Execute BUILD_PLAN.md Step 7. Build /chats/[id]/profile: a form for tone
notes, no-send rules (e.g. "no messages after 9pm"), and relationship notes,
saved to the contacts table. Wire these fields into the /api/ai/rewrite call
as contactRules so the AI actually uses them.

Acceptance check: setting a no-send rule like "never send anything about work
after 6pm" visibly changes the tone/content of the 3 AI options on the next
rewrite for that contact.
```

---

## Prompt 8 — Step 8: End-to-end local test

```
Run through BUILD_PLAN.md Step 8 yourself: two test accounts, two browser
windows, full flow — sign in, open a conversation, set a contact rule, draft
a message, get AI options, send one, confirm realtime delivery on the other
side. Report any errors found and fix them. Don't add anything not in
PRD.md section 4 while fixing bugs.
```

---

## Prompt 9 — Deploy

```
Execute BUILD_PLAN.md Phase 4. Add a PWA manifest (app/manifest.ts, Next.js
15 native support) so the app is installable on iPhone home screen. Push to
GitHub, walk me through connecting the repo on Vercel and which env vars to
set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
OPENROUTER_API_KEY, LLM_MODEL). After I deploy, tell me exactly what to test
on my phone to confirm it's live and working.
```

---

## If the agent tries to freelance

Paste this any time it starts adding scope:

```
Stop — that's not in PRD.md section 4. Add it to NOTES.md under v1.1 and
go back to the current BUILD_PLAN.md step only.
```
