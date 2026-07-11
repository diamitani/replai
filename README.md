# ReplyGuard AI

Run the SQL migration in Supabase Dashboard → SQL Editor before first use:

`supabase/migrations/001_initial_schema.sql`

## Setup

1. Copy `.env.example` to `.env.local` and fill in keys
2. Run migration SQL in Supabase
3. Add redirect URL in Supabase Auth: `http://localhost:3000/auth/callback`
4. `npm install && npm run dev`

## Stack

Next.js 15, Supabase, Vercel AI SDK (OpenRouter), Tailwind, shadcn/ui
