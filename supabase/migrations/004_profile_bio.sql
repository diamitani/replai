-- Short public bio for discovery / pre-message context

alter table public.users
  add column if not exists bio text;

alter table public.users
  drop constraint if exists users_bio_length;

alter table public.users
  add constraint users_bio_length
  check (bio is null or char_length(bio) <= 160);

-- Recreate discovery RPCs to include bio
drop function if exists public.find_user_by_username(text);
drop function if exists public.get_public_profiles(uuid[]);
drop function if exists public.find_user_by_email(text);
drop function if exists public.search_users(text, int);

create or replace function public.find_user_by_username(lookup_username text)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean,
  bio text
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable, u.bio
  from public.users u
  where u.username = lower(trim(lookup_username))
    and auth.uid() is not null
    and u.id <> auth.uid()
  limit 1;
$$;

create or replace function public.get_public_profiles(target_ids uuid[])
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean,
  bio text
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable, u.bio
  from public.users u
  where auth.uid() is not null
    and u.id = any(target_ids);
$$;

create or replace function public.find_user_by_email(lookup_email text)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean,
  bio text
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.display_name, u.is_discoverable, u.bio
  from public.users u
  where lower(u.email) = lower(trim(lookup_email))
    and auth.uid() is not null
    and u.id <> auth.uid()
  limit 1;
$$;

create or replace function public.search_users(search_query text, result_limit int default 20)
returns table (
  id uuid,
  username text,
  display_name text,
  is_discoverable boolean,
  bio text,
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

  return query
  select
    u.id,
    u.username,
    u.display_name,
    u.is_discoverable,
    u.bio,
    'username'::text as match_type
  from public.users u
  where u.username = bare
    and u.id <> auth.uid()
  limit 1;

  if found then
    return;
  end if;

  return query
  select
    u.id,
    u.username,
    u.display_name,
    u.is_discoverable,
    u.bio,
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
