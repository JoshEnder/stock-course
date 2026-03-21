create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  completed_lesson_ids text[] not null default '{}',
  hearts integer not null default 5,
  last_opened_lesson_id text,
  last_heart_refill_at timestamptz,
  last_streak_active_on text,
  seeded_demo boolean not null default false,
  nickname text not null default 'Learner',
  certificate_id text,
  last_login_ip text,
  last_login_at timestamptz,
  streak_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_progress_set_updated_at on public.user_progress;

create trigger user_progress_set_updated_at
before update on public.user_progress
for each row
execute function public.set_user_progress_updated_at();

alter table public.user_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.user_progress;
create policy "Users can read their own progress"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.user_progress;
create policy "Users can insert their own progress"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.user_progress;
create policy "Users can update their own progress"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.user_progress to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.user_progress;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
