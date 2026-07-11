# Replai — Auth & URLs

Quick reference for Supabase auth (email/password + Google OAuth).
Secrets stay in `.env.local` / Vercel — never commit real keys.

## Production

| Item | Value |
|---|---|
| App URL | `https://replai-psi.vercel.app` |
| Login | `https://replai-psi.vercel.app/login` |
| Auth callback | `https://replai-psi.vercel.app/auth/callback` |
| GitHub | `https://github.com/diamitani/replai` |
| Vercel project | `artispreneur/replai` |

## Local

| Item | Value |
|---|---|
| App URL | `http://localhost:3000` |
| Auth callback | `http://localhost:3000/auth/callback` |

## Supabase project

| Item | Value |
|---|---|
| Project ref | `potuzocstvlrlmlrneid` |
| API URL | `https://potuzocstvlrlmlrneid.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/potuzocstvlrlmlrneid |
| Auth providers | https://supabase.com/dashboard/project/potuzocstvlrlmlrneid/auth/providers |
| URL config | https://supabase.com/dashboard/project/potuzocstvlrlmlrneid/auth/url-configuration |

## Supabase → Authentication → URL Configuration

**Site URL (production):**
```
https://replai-psi.vercel.app
```

**Redirect URLs (add all):**
```
http://localhost:3000/auth/callback
https://replai-psi.vercel.app/auth/callback
```

## Email / password

1. Providers → **Email** → enabled
2. **Confirm email** → **OFF** (signup signs in immediately)
3. App uses `signInWithPassword` / `signUp` — not magic link

## Google OAuth

1. Providers → **Google** → enable
2. Google Cloud Console → OAuth client → Authorized redirect URI:
```
https://potuzocstvlrlmlrneid.supabase.co/auth/v1/callback
```
3. Paste Client ID + Client Secret into Supabase Google provider

## Env vars (Vercel + `.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://potuzocstvlrlmlrneid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=          # from Supabase → Settings → API
SUPABASE_PROJECT_REF=potuzocstvlrlmlrneid
DEEPSEEK_API_KEY=                      # from platform.deepseek.com
LLM_MODEL=deepseek-chat
DEEPSEEK_LOW_BALANCE_USD=5
NEXT_PUBLIC_APP_URL=https://replai-psi.vercel.app   # local: http://localhost:3000
```

Copy from `.env.example` → `.env.local` and fill secrets.
