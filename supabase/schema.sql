-- Run this in the Supabase SQL editor once.

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "Users manage their own stats" on public.user_stats;
create policy "Users manage their own stats"
  on public.user_stats
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
