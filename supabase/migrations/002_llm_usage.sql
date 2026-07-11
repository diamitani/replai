-- LLM usage tracking for DeepSeek billing reports

create table if not exists public.llm_usage (
  id uuid primary key default gen_random_uuid(),
  model text not null default 'deepseek-chat',
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.llm_usage_state (
  id integer primary key default 1 check (id = 1),
  total_spent_usd numeric(12, 6) not null default 0,
  last_reported_threshold_usd numeric(12, 2) not null default 0,
  low_balance_alerted boolean not null default false,
  updated_at timestamptz default now()
);

insert into public.llm_usage_state (id) values (1) on conflict (id) do nothing;

alter table public.llm_usage enable row level security;
alter table public.llm_usage_state enable row level security;

create policy "llm_usage_select_authenticated" on public.llm_usage
  for select to authenticated using (true);

create policy "llm_usage_state_select_authenticated" on public.llm_usage_state
  for select to authenticated using (true);

create or replace function public.record_llm_usage(
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_estimated_cost_usd numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric;
  v_last_threshold numeric;
  v_new_threshold integer;
  v_milestone_reached boolean := false;
  v_milestone_usd numeric := null;
begin
  insert into public.llm_usage (
    model,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    estimated_cost_usd
  ) values (
    'deepseek-chat',
    p_prompt_tokens,
    p_completion_tokens,
    p_prompt_tokens + p_completion_tokens,
    p_estimated_cost_usd
  );

  update public.llm_usage_state
  set
    total_spent_usd = total_spent_usd + p_estimated_cost_usd,
    updated_at = now()
  where id = 1
  returning total_spent_usd, last_reported_threshold_usd
  into v_total, v_last_threshold;

  v_new_threshold := floor(v_total / 10)::integer * 10;

  if v_new_threshold > v_last_threshold and v_new_threshold >= 10 then
    update public.llm_usage_state
    set last_reported_threshold_usd = v_new_threshold
    where id = 1;
    v_milestone_reached := true;
    v_milestone_usd := v_new_threshold;
  end if;

  return jsonb_build_object(
    'total_spent_usd', v_total,
    'milestone_reached', v_milestone_reached,
    'milestone_usd', v_milestone_usd,
    'this_request_cost_usd', p_estimated_cost_usd
  );
end;
$$;

grant execute on function public.record_llm_usage(integer, integer, numeric) to authenticated;
