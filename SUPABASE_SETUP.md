# Supabase setup

## 1. Run migration

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/potuzocstvlrlmlrneid/sql/new) and paste the full contents of:

Run both migrations in Supabase Dashboard → SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_llm_usage.sql` (DeepSeek usage tracking)

Click **Run**.

## 2. Auth (email + Google OAuth)

### Email / password
1. Authentication → Providers → **Email** → enable
2. Turn **Confirm email** OFF (so signup signs in immediately)
3. Disable magic link if you want — the app uses password auth now

### Google OAuth
1. Authentication → Providers → **Google** → enable
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Authorized redirect URI: `https://potuzocstvlrlmlrneid.supabase.co/auth/v1/callback`
3. Paste Client ID + Client Secret into Supabase Google provider settings

### Redirect URLs
Authentication → URL Configuration:

- Site URL: `https://replai-psi.vercel.app` (prod) or `http://localhost:3000` (local)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://replai-psi.vercel.app/auth/callback`

## 3. Realtime

Migration enables realtime on `messages`. Verify in Database → Replication that `messages` is enabled.

## 4. CLI (optional)

```bash
supabase login
supabase link --project-ref potuzocstvlrlmlrneid
supabase db push
```
