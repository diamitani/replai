-- Private original drafts: only the sender can see what they really typed,
-- unless they explicitly share draft history with the other person.

-- 1. Private drafts vault (one row per rewritten message)
create table if not exists public.private_drafts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  original_text text not null,
  created_at timestamptz default now()
);

create index if not exists private_drafts_owner_conversation_idx
  on public.private_drafts (owner_id, conversation_id, created_at);

create index if not exists private_drafts_conversation_idx
  on public.private_drafts (conversation_id, created_at);

-- 2. Per-conversation share grants: owner lets viewer see their originals
create table if not exists public.draft_shares (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  viewer_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (conversation_id, owner_id, viewer_id),
  check (owner_id <> viewer_id)
);

create index if not exists draft_shares_viewer_idx
  on public.draft_shares (viewer_id, conversation_id);

-- 3. Migrate existing ai_original_draft values into the vault
insert into public.private_drafts (message_id, conversation_id, owner_id, original_text, created_at)
select
  m.id,
  m.conversation_id,
  m.sender_id,
  m.ai_original_draft,
  m.created_at
from public.messages m
where m.ai_original_draft is not null
  and length(trim(m.ai_original_draft)) > 0
on conflict (message_id) do nothing;

-- 4. Strip originals from the public messages table (recipient must not see them)
update public.messages
set ai_original_draft = null
where ai_original_draft is not null;

-- Keep ai_was_rewritten as a public signal ("this was AI-assisted") without exposing the draft.
-- Drop the column later if desired; for now null it out and stop writing to it.

-- 5. RLS
alter table public.private_drafts enable row level security;
alter table public.draft_shares enable row level security;

-- Owner always sees their own drafts
create policy "private_drafts_select_owner" on public.private_drafts
  for select using (auth.uid() = owner_id);

-- Viewer sees drafts only when owner granted share for that conversation
create policy "private_drafts_select_shared" on public.private_drafts
  for select using (
    exists (
      select 1 from public.draft_shares s
      where s.conversation_id = private_drafts.conversation_id
        and s.owner_id = private_drafts.owner_id
        and s.viewer_id = auth.uid()
    )
  );

-- Only the owner (message sender) can insert their draft
create policy "private_drafts_insert_owner" on public.private_drafts
  for insert with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.messages m
      where m.id = private_drafts.message_id
        and m.sender_id = auth.uid()
        and m.conversation_id = private_drafts.conversation_id
    )
  );

create policy "private_drafts_delete_owner" on public.private_drafts
  for delete using (auth.uid() = owner_id);

-- Draft shares: owner manages grants; viewer can see grants that include them
create policy "draft_shares_select_involved" on public.draft_shares
  for select using (auth.uid() = owner_id or auth.uid() = viewer_id);

create policy "draft_shares_insert_owner" on public.draft_shares
  for insert with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.conversations c
      where c.id = draft_shares.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
        and (c.user_a = draft_shares.viewer_id or c.user_b = draft_shares.viewer_id)
    )
  );

create policy "draft_shares_delete_owner" on public.draft_shares
  for delete using (auth.uid() = owner_id);
