# ReplyGuard AI — Product Requirements Document

**FPE: I always finish. I have a process and it's effective.**
**PAL:** Parse (raw idea below) → Abstract (5 locked MVP features) → Layer (build order in BUILD_PLAN.md)

---

## Reality check (read this first)

The original ask included sending real iMessages/SMS to any phone number via webhook. That's not possible for a third-party app — Apple has no public API for sending iMessage as another user's Messages app, and iOS blocks silent SMS sends. Real phone-network delivery requires a telephony backend (Twilio) and is scoped as **Phase 2**, not tonight.

**What ships tonight:** an iMessage-styled real-time chat where both people use the app, with an AI layer that rewrites your draft before you send it, based on per-contact rules (tone, history, "don't send after 9pm to this person"). That's the actual product — the AI compose layer is the differentiator, not the transport.

---

## 1. Product Brief

ReplyGuard AI is a messaging app for people who've sent a text they regretted. Before a message goes out, an AI layer reads it against rules you set per contact — tone, history, timing, relationship context — and offers you 2-3 rewritten versions or lets you edit before it sends. Users are anyone who's ever wanted a beat before hitting send. Differentiation: it's not a filter that blocks you, it's a co-pilot that rewrites in your voice. Success: 5 real users send at least 10 AI-assisted messages each in week one.

## 2. Jobs to be Done

1. As a user, I want to draft a message and get AI rewrite options so that I don't send something I'll regret.
2. As a user, I want to set rules per contact (tone, timing, no-send windows) so that the AI knows the context automatically.
3. As a user, I want real-time delivery to the other person so that this feels like a real chat, not a delayed app.
4. As a user, I want a contact profile with history/summary so that I have context before I reply.
5. As a user, I want to see analytics on my messaging patterns so I can spot what I want to change. *(v1.1)*

## 3. Sitemap (locked)

```
/                    → Landing / sign in
/chats               → Conversation list (iMessage-style)
/chats/[id]          → Thread view + compose bar
/chats/[id]/profile  → Contact profile: rules, history, summary
/settings            → Account, notification prefs
```

## 4. MVP features — locked, no additions until shipped

1. **Auth** — email magic link (Supabase Auth, free, no Twilio needed)
2. **Real-time 1:1 chat** — Supabase Realtime channel per conversation
3. **AI compose layer** — draft → Claude API rewrite → 2-3 options + manual edit → send
4. **Contact rules** — per-contact text field(s): tone, do-not-send windows, relationship notes
5. **iMessage-style UI** — bubbles, timestamps, typing indicator

**Everything else is v1.1:** analytics dashboard, conversation summaries, group chats, native iOS app, real SMS via Twilio, push notifications, Apple Sign In.

## 5. Tech stack (locked, no pivoting)

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 + TypeScript, deployed as installable PWA |
| Styling | Tailwind CSS |
| Components | shadcn/ui via 21st.dev catalog (chat UI, see 5b) |
| Realtime | Supabase Realtime (Postgres changefeed) |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email magic link) |
| Backend (API) | Next.js API routes (Node) — modular, one route per concern |
| AI orchestration | Modular provider layer, see 5c |
| Rules/analytics engine | Python (FastAPI), v1.1 — separate deploy, called over HTTP |
| Deploy | Vercel (frontend + Node routes), Railway (Python service, v1.1) |

### 5a. Why modular, not monolithic

Each concern lives in its own folder with a clean interface so any piece can be swapped or handed to an agent to build in isolation:
```
/lib/llm/          → provider adapters, swappable per call
/lib/supabase/      → db client, realtime subscriptions
/app/api/           → thin Node route handlers, no business logic
/services/rules/     → Python microservice (v1.1) — no-send windows, tone scoring
```

### 5b. UI components (21st.dev, install via shadcn CLI)

| Component | Use | Install |
|---|---|---|
| Chat Interface (@tonyzebastian) | Thread view shell, message list + bubbles | `npx shadcn@latest add https://21st.dev/r/tonyzebastian/chat-interface` |
| Advanced AI Chat Input (@ravikatiyar162) | Compose bar — supports the "AI check" action button next to send | `npx shadcn@latest add https://21st.dev/r/ravikatiyar162/advanced-ai-chat-input` |
| AI Chat (@beratberkayg) | Reference for the rewrite-options picker UI (3 option cards) | `npx shadcn@latest add https://21st.dev/r/beratberkayg/ai-chat` |

All three are shadcn-based (Tailwind, drop into `components/ui/`), no extra design system to learn.

### 5c. LLM provider layer (Vercel AI SDK, multi-provider)

**SDK choice: Vercel AI SDK**, not Google ADK. ADK is a Python/Java framework for multi-agent orchestration (planner agents delegating to sub-agents) — a different problem than rewriting one draft into 3 options. AI SDK is Next.js-native and gives you one call (`generateObject`) that works across every provider below by swapping a `model` argument — plus native structured JSON output via Zod, no manual parsing.

```typescript
// lib/llm/models.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { bedrock } from "@ai-sdk/amazon-bedrock";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export function getModel(name = process.env.LLM_MODEL || "openrouter:deepseek/deepseek-chat") {
  const [provider, ...rest] = name.split(":");
  const modelId = rest.join(":");
  if (provider === "bedrock") return bedrock(modelId); // enterprise/Hermes path
  return openrouter(modelId); // gateway: deepseek/deepseek-chat, x-ai/grok-2, google/gemini-2.0-flash, anthropic/claude-sonnet-4-6
}
```

| Provider | Role | Notes |
|---|---|---|
| OpenRouter (via `@openrouter/ai-sdk-provider`) | Default gateway | One key routes to DeepSeek, xAI (Grok), Gemini, and Claude |
| AWS Bedrock (via `@ai-sdk/amazon-bedrock`) | Enterprise/Hermes path | Same `getModel()` interface, swap the `LLM_MODEL` env var to `bedrock:...` once your Bedrock/Hermes integration is unblocked |

Swapping models later (DeepSeek → Grok → Gemini → Claude) is a one-line env var change — no code touched.

## 6. Database schema

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  contact_user_id uuid not null references users(id) on delete cascade,
  tone_notes text,
  no_send_rules text,
  relationship_notes text,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id) on delete cascade,
  user_b uuid not null references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  ai_original_draft text,
  ai_was_rewritten boolean default false,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
```

## 7. API schema

| Method | Path | Request | Response |
|---|---|---|---|
| POST | /api/ai/rewrite | `{draft, contactRules, recentHistory}` | `{options: string[3]}` |
| POST | /api/messages/send | `{conversationId, content}` | `{message}` |
| GET | /api/conversations | — | `{conversations[]}` |
| GET | /api/contacts/:id | — | `{contact}` |
| PUT | /api/contacts/:id | `{toneNotes, noSendRules, relationshipNotes}` | `{contact}` |

## 8. Success metric

5 real users (you + 4 friends/testers) send 10+ AI-assisted messages each within 7 days of shipping.
