create table if not exists public.wedding_public_site (
  site_key boolean primary key default true check (site_key),
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wedding_public_site enable row level security;

grant select, insert, update, delete on public.wedding_public_site to authenticated;
revoke all on public.wedding_public_site from anon;

create policy "Users manage their public wedding site"
  on public.wedding_public_site for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.get_public_wedding_settings()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select data
  from public.wedding_public_site
  where site_key = true
  limit 1;
$$;

revoke all on function public.get_public_wedding_settings() from public;
grant execute on function public.get_public_wedding_settings() to anon, authenticated;
