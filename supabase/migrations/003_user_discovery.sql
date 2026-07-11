-- User discovery: usernames, privacy, contact invites

alter table public.users
  add column if not exists username text,
  add column if not exists is_discoverable boolean not null default true;

create unique index if not exists users_username_unique_idx
  on public.users (lower(username))
  where username is not null;

alter table public.users
  drop constraint if exists users_username_format;

alter table public.users
  add constraint users_username_format
  check (
    username is null
    or username ~ '^[a-z0-9_]{3,30}$'
  );

create table if not exists public.contact_invites (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  responded_at timestamptz,
  check (from_user_id <> to_user_id),
  unique (from_user_id, to_user_id)
);

create index if not exists contact_invites_to_user_status_idx
  on public.contact_invites (to_user_id, status);

create index if not exists contact_invites_from_user_status_idx
  on public.contact_invites (from_user_id, status);

alter table public.contact_invites enable row level security;

create policy "invites_select_participant" on public.contact_invites
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "invites_insert_sender" on public.contact_invites
  for insert with check (auth.uid() = from_user_id);

create policy "invites_update_participant" on public.contact_invites
  for update using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Discovery goes through security-definer RPCs below (no email leakage).

-- Exact username lookup for private users (invite-by-username)
create or replace function public.find_user_by_username(lookup_username text)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable
  from public.users u
  where u.username = lower(trim(lookup_username))
    and auth.uid() is not null
    and u.id <> auth.uid()
  limit 1;
$$;

-- Public profile by id (no email)
create or replace function public.get_public_profiles(target_ids uuid[])
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable
  from public.users u
  where auth.uid() is not null
    and u.id = any(target_ids);
$$;

-- Email lookup for legacy start-chat-by-email (no email returned)
create or replace function public.find_user_by_email(lookup_email text)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable
  from public.users u
  where lower(u.email) = lower(trim(lookup_email))
    and auth.uid() is not null
    and u.id <> auth.uid()
  limit 1;
$$;

-- Name / username search — only discoverable users (plus exact username via find)
create or replace function public.search_users(search_query text, result_limit int default 20)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean,
  match_type text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  q text := lower(trim(search_query));
  bare text;
begin
  if auth.uid() is null then
    return;
  end if;

  if q is null or length(q) < 1 then
    return;
  end if;

  bare := regexp_replace(q, '^@', '');

  -- Exact username match always works (private or open)
  return query
  select
    u.id,
    u.username,
    u.display_name,
    u.is_discoverable,
    'username'::text as match_type
  from public.users u
  where u.username = bare
    and u.id <> auth.uid()
  limit 1;

  if found then
    return;
  end if;

  -- Partial search only for discoverable users
  return query
  select
    u.id,
    u.username,
    u.display_name,
    u.is_discoverable,
    case
      when u.username is not null and u.username like bare || '%' then 'username'
      else 'name'
    end as match_type
  from public.users u
  where u.id <> auth.uid()
    and u.is_discoverable = true
    and (
      (u.username is not null and u.username like '%' || bare || '%')
      or (u.display_name is not null and lower(u.display_name) like '%' || bare || '%')
    )
  order by
    case when u.username = bare then 0 else 1 end,
    case when u.username like bare || '%' then 0 else 1 end,
    coalesce(u.display_name, u.username)
  limit greatest(1, least(result_limit, 50));
end;
$$;

grant execute on function public.find_user_by_username(text) to authenticated;
grant execute on function public.get_public_profiles(uuid[]) to authenticated;
grant execute on function public.find_user_by_email(text) to authenticated;
grant execute on function public.search_users(text, int) to authenticated;
