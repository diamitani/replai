# ReplyGuard AI — Notes

## Agent suggestions

- 21st.dev chat components require authentication; built equivalent shadcn-based components in `components/ui/` instead.
- LLM switched from OpenRouter to DeepSeek direct API (`DEEPSEEK_API_KEY`). Usage tracked with $10 milestone alerts and low-balance warnings in Settings + chat.

## Private original drafts (shipped)

- Rewritten messages store the real draft in `private_drafts` (sender-only RLS).
- Public `messages` rows never include the original text.
- Per-conversation share toggle on contact profile grants the other person read access.
- In-thread: “What I really typed” / “What they really typed” expands when allowed.

## v1.1 (out of scope for MVP)

- Real SMS/iMessage via Twilio
- Native iOS / TestFlight / Capacitor
- Push notifications (APNs)
- Analytics dashboard
- Conversation summaries
- Python FastAPI rules engine on Railway
- Apple Sign In
- Group chats
