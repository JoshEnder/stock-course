create or replace function public.is_reserved_username(input text)
returns boolean
language sql
immutable
as $$
  select coalesce(lower(input), '') = any (
    array[
      'admin',
      'administrator',
      'api',
      'app',
      'auth',
      'billing',
      'contact',
      'help',
      'leaderboard',
      'login',
      'logout',
      'me',
      'mod',
      'moderator',
      'onboarding',
      'privacy',
      'profile',
      'root',
      'settings',
      'signup',
      'stoked',
      'support',
      'system',
      'team'
    ]
  );
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text,
  username_normalized text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length_check check (
    username is null or char_length(username) between 3 and 20
  ),
  constraint profiles_username_format_check check (
    username is null or username ~ '^[A-Za-z0-9_.]{3,20}$'
  ),
  constraint profiles_username_normalized_check check (
    (username is null and username_normalized is null)
    or (username is not null and username_normalized = lower(username))
  ),
  constraint profiles_reserved_username_check check (
    username_normalized is null or not public.is_reserved_username(username_normalized)
  )
);

create unique index if not exists profiles_username_normalized_unique_idx
on public.profiles (username_normalized)
where username_normalized is not null;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

insert into public.profiles (user_id)
select up.user_id
from public.user_progress up
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "Users can read public profiles" on public.profiles;
create policy "Users can read public profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.profiles to authenticated;
