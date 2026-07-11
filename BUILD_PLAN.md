# ReplyGuard AI — Build Plan

**ROSTR pass on this doc:** Receive (PRD.md) → Orchestrate (task order below) → Synthesize (agent harness executes) → Transform (Vercel deploy) → Return (live PWA URL)

Feed this file + PRD.md into your agent harness (Claude Code, Cursor, etc.) in order. Don't skip steps — each depends on the last existing.

---

## Phase 3: Build (tonight, ~4-5 hrs with an agent harness)

### Step 1 — Repo setup (15 min)
```bash
npx create-next-app@latest replyguard-ai --typescript --tailwind --app
cd replyguard-ai
npx shadcn@latest init
npx shadcn@latest add button input card avatar textarea

# 21st.dev chat UI (see PRD.md 5b)
npx shadcn@latest add https://21st.dev/r/tonyzebastian/chat-interface
npx shadcn@latest add https://21st.dev/r/ravikatiyar162/advanced-ai-chat-input
npx shadcn@latest add https://21st.dev/r/beratberkayg/ai-chat

npm install @supabase/supabase-js @supabase/ssr ai @openrouter/ai-sdk-provider @ai-sdk/amazon-bedrock zod
git init && git add . && git commit -m "init"
```
`ai` is the Vercel AI SDK core. `@openrouter/ai-sdk-provider` is your default gateway to DeepSeek/xAI/Gemini/Claude. `@ai-sdk/amazon-bedrock` is the separate enterprise/Hermes path — same interface, different provider.

Push to GitHub (`gh repo create` or manually via github.com) before continuing — Vercel deploys off the repo.

### Step 2 — Supabase project (15 min)
1. Create project at supabase.com (free tier)
2. SQL editor → paste the schema from `PRD.md` section 6 → run
3. Enable Realtime on the `messages` table (Database → Replication)
4. Copy project URL + anon key

### Step 3 — Auth (30 min)
- Supabase Auth, email magic link only (no phone/Twilio needed)
- File: `app/(auth)/login/page.tsx` — email input, "send magic link" button
- File: `lib/supabase/client.ts` and `lib/supabase/server.ts` — standard SSR client setup
- Test: sign up, click link in email, land on `/chats`

### Step 4 — Conversation list (`/chats`) (30 min)
- Protected route, redirect to `/login` if no session
- List conversations for current user, most recent message preview
- Empty state: "Start a conversation" if none exist

### Step 5 — Thread view (`/chats/[id]`) (45 min)
- iMessage-style bubbles (sender = right/blue, recipient = left/gray)
- Subscribe to Supabase Realtime channel for this conversation — new rows in `messages` push instantly
- Compose bar at bottom, plain textarea + send button (AI layer comes next)

### Step 6 — AI compose layer (60-90 min, this is the core feature)

Vercel AI SDK's `generateObject` + Zod gives you structured output directly — no manual JSON parsing, and the model is swappable via one function.

- `lib/llm/models.ts`:
  ```typescript
  import { createOpenRouter } from "@openrouter/ai-sdk-provider";
  import { bedrock } from "@ai-sdk/amazon-bedrock";

  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

  export function getModel(name = process.env.LLM_MODEL || "openrouter:deepseek/deepseek-chat") {
    const [provider, ...rest] = name.split(":");
    const modelId = rest.join(":");
    if (provider === "bedrock") return bedrock(modelId);
    return openrouter(modelId);
  }
  ```

- `lib/llm/rewrite.ts`:
  ```typescript
  import { generateObject } from "ai";
  import { z } from "zod";
  import { getModel } from "./models";

  const RewriteSchema = z.object({ options: z.array(z.string()).length(3) });

  export async function rewriteMessage(draft: string, contactRules: string, history: string) {
    const { object } = await generateObject({
      model: getModel(),
      schema: RewriteSchema,
      system: `You rewrite text messages to fit the sender's rules for this contact.
      Contact rules: ${contactRules}
      Recent conversation context: ${history}`,
      prompt: draft,
    });
    return object.options;
  }
  ```

- `app/api/ai/rewrite/route.ts`:
  ```typescript
  import { rewriteMessage } from "@/lib/llm/rewrite";

  export async function POST(req: Request) {
    const { draft, contactRules, recentHistory } = await req.json();
    const options = await rewriteMessage(draft, contactRules, recentHistory);
    return Response.json({ options });
  }
  ```
  Swap models any time via the `LLM_MODEL` env var: `openrouter:deepseek/deepseek-chat`, `openrouter:x-ai/grok-2`, `openrouter:google/gemini-2.0-flash`, `openrouter:anthropic/claude-sonnet-4-6`, or `bedrock:...` — zero code changes.

- UI: use the AI Chat option-picker pattern from `@beratberkayg`'s component (installed in Step 1) — user types draft → taps "AI check" → shows 3 option cards + "send as-is" + edit-inline option → tap one → sends
- Store both `content` (final sent) and `ai_original_draft` on the message row for later analytics (v1.1)

### Step 7 — Contact profile (`/chats/[id]/profile`) (30 min)
- Form: tone notes, no-send rules (free text, e.g. "no messages after 9pm"), relationship notes
- Saves to `contacts` table, read by the rewrite API on every send

### Step 8 — Local test (15 min)
- Two browser windows, two test accounts, send messages back and forth
- Confirm: realtime delivery works, AI rewrite returns 3 options, contact rules actually change tone

---

## Phase 4: Deploy (30 min)

```bash
git push origin main
```
1. vercel.com → New Project → import repo
2. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`, `LLM_MODEL` (default `openrouter:deepseek/deepseek-chat`)
3. Deploy
4. Add PWA manifest (`app/manifest.ts` in Next.js 15) so it's installable on iPhone home screen — this is your "TestFlight substitute" for tonight
5. Test the live URL end to end on your actual phone: sign up, add a contact, send a rewritten message, confirm realtime delivery

**Done tonight = live URL + installable on your phone + one real message sent through the full AI flow.**

---

## Phase 2 (later, needs a little money): real SMS

- Twilio account ($15 free trial credit), buy a number
- New API route sends via Twilio's `messages.create` after the AI rewrite step
- Recipient without the app receives a real text from your Twilio number — not blue-bubble iMessage, and not "from" the sender's own number, but real-world delivery
- This is the point where a $99/yr Apple Developer account becomes worth it too, if you want push notifications + App Store distribution instead of PWA

## Phase 3 (later): native iOS + TestFlight

- Wrap the PWA in Capacitor or rebuild critical screens in SwiftUI
- Apple Developer Program ($99/yr) required for TestFlight
- Add push notifications (APNs) so it feels like real texting, not "open the app to see if you got a reply"

---

## Scope discipline

If you catch yourself adding anything not in PRD.md section 4 before tonight's deploy — stop, it's v1.1. FPE: finish this version first.
