create table if not exists public.waitlist_signups (
  email text primary key,
  source text not null default 'stoked_waitlist',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_signups_email_lowercase check (email = lower(email))
);

create or replace function public.set_waitlist_signups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists waitlist_signups_set_updated_at on public.waitlist_signups;

create trigger waitlist_signups_set_updated_at
before update on public.waitlist_signups
for each row
execute function public.set_waitlist_signups_updated_at();

alter table public.waitlist_signups enable row level security;

revoke all on public.waitlist_signups from anon;
revoke all on public.waitlist_signups from authenticated;
