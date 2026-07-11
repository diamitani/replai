# Deploy to Vercel

## 1. Prerequisites

- Run Supabase migration (see `SUPABASE_SETUP.md`)
- Add `OPENROUTER_API_KEY` to `.env.local`
- Push repo to GitHub

## 2. Vercel project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `replaimsg` repo
3. Root directory: `replaimsg` (if repo root is `Replai`) or `.` if repo is just replaimsg
4. Add environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://potuzocstvlrlmlrneid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your publishable/anon key |
| `DEEPSEEK_API_KEY` | your DeepSeek API key |
| `LLM_MODEL` | `deepseek-chat` |
| `DEEPSEEK_LOW_BALANCE_USD` | `5` |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL |

5. Deploy

## 3. Post-deploy

1. Add Vercel URL to Supabase Auth redirect URLs: `https://YOUR_APP.vercel.app/auth/callback`
2. On iPhone: open the URL in Safari → Share → Add to Home Screen

## 4. E2E test checklist

- [ ] Sign up user A with magic link
- [ ] Sign up user B in another browser/incognito
- [ ] User A starts chat with user B's email
- [ ] Send plain message — appears in B's window within ~1s
- [ ] Set contact rules on profile page
- [ ] Draft message → AI check → pick option → sends
- [ ] Rules visibly change rewrite tone
