# Deploy to Vercel

See also: `AUTH.md` (URLs + auth checklist), `SUPABASE_SETUP.md` (migrations).

## Live

| | |
|---|---|
| Production | https://replai-psi.vercel.app |
| Login | https://replai-psi.vercel.app/login |
| GitHub | https://github.com/diamitani/replai |
| Vercel | artispreneur/replai |

## Env vars (Vercel → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://potuzocstvlrlmlrneid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Settings → API |
| `SUPABASE_PROJECT_REF` | `potuzocstvlrlmlrneid` |
| `DEEPSEEK_API_KEY` | from platform.deepseek.com |
| `LLM_MODEL` | `deepseek-chat` |
| `DEEPSEEK_LOW_BALANCE_USD` | `5` |
| `NEXT_PUBLIC_APP_URL` | `https://replai-psi.vercel.app` |

## Post-deploy auth

1. Supabase → URL Configuration
   - Site URL: `https://replai-psi.vercel.app`
   - Redirect: `https://replai-psi.vercel.app/auth/callback`
2. Email provider: **Confirm email OFF**
3. Google provider: enable + Client ID/Secret
4. Google Cloud redirect URI: `https://potuzocstvlrlmlrneid.supabase.co/auth/v1/callback`

## Redeploy

```bash
cd replaimsg
vercel deploy --prod --yes
```

## E2E checklist

- [ ] Sign up with email/password (or Google)
- [ ] Second user in another browser
- [ ] Start chat by email/username
- [ ] Send message — appears in realtime
- [ ] Set contact rules → AI rewrite uses them
