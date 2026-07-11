# Supabase setup

## 1. Run migration

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/potuzocstvlrlmlrneid/sql/new) and paste the full contents of:

Run both migrations in Supabase Dashboard → SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_llm_usage.sql` (DeepSeek usage tracking)

Click **Run**.

## 2. Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

- Site URL: `http://localhost:3000` (and your Vercel URL after deploy)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`

## 3. Realtime

Migration enables realtime on `messages`. Verify in Database → Replication that `messages` is enabled.

## 4. CLI (optional)

```bash
supabase login
supabase link --project-ref potuzocstvlrlmlrneid
supabase db push
```
