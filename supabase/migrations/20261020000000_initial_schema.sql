create table if not exists public.wedding_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  primary key (user_id, name)
);

create table if not exists public.wedding_tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  payload jsonb not null,
  primary key (user_id, id)
);

create table if not exists public.wedding_savings (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  payload jsonb not null,
  primary key (user_id, id)
);

create table if not exists public.wedding_expenses (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  payload jsonb not null,
  primary key (user_id, id)
);

create table if not exists public.wedding_guests (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  payload jsonb not null,
  primary key (user_id, id)
);

create unique index if not exists wedding_guests_invitation_token_idx
  on public.wedding_guests ((payload ->> 'token'))
  where payload ->> 'token' is not null;

create table if not exists public.wedding_invitation_templates (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  payload jsonb not null,
  primary key (user_id, id)
);

alter table public.wedding_preferences enable row level security;
alter table public.wedding_categories enable row level security;
alter table public.wedding_tasks enable row level security;
alter table public.wedding_savings enable row level security;
alter table public.wedding_expenses enable row level security;
alter table public.wedding_guests enable row level security;
alter table public.wedding_invitation_templates enable row level security;

grant select, insert, update, delete on
  public.wedding_preferences,
  public.wedding_categories,
  public.wedding_tasks,
  public.wedding_savings,
  public.wedding_expenses,
  public.wedding_guests,
  public.wedding_invitation_templates
to authenticated;

revoke all on
  public.wedding_preferences,
  public.wedding_categories,
  public.wedding_tasks,
  public.wedding_savings,
  public.wedding_expenses,
  public.wedding_guests,
  public.wedding_invitation_templates
from anon;

create policy "Users manage their wedding preferences"
  on public.wedding_preferences for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding categories"
  on public.wedding_categories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding tasks"
  on public.wedding_tasks for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding savings"
  on public.wedding_savings for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding expenses"
  on public.wedding_expenses for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding guests"
  on public.wedding_guests for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their wedding invitation templates"
  on public.wedding_invitation_templates for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.get_public_wedding_guest(invitation_token text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', id,
    'name', payload -> 'name',
    'passes', payload -> 'passes',
    'status', payload -> 'status',
    'confirmedPasses', payload -> 'confirmedPasses',
    'token', payload -> 'token'
  )
  from public.wedding_guests
  where payload ->> 'token' = invitation_token
  limit 1;
$$;

create or replace function public.submit_public_wedding_rsvp(
  invitation_token text,
  response_status text,
  attendees integer,
  guest_comment text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest_row public.wedding_guests%rowtype;
  guest_data jsonb;
begin
  if response_status is null or response_status not in ('Confirmado', 'Declinado') then
    raise exception 'Estado de RSVP inválido';
  end if;

  select * into guest_row
  from public.wedding_guests
  where payload ->> 'token' = invitation_token
  limit 1
  for update;

  if not found then
    raise exception 'Invitación no encontrada';
  end if;

  if attendees is null
    or attendees < 0
    or attendees > (guest_row.payload ->> 'passes')::integer then
    raise exception 'Número de asistentes inválido';
  end if;

  guest_data := guest_row.payload || jsonb_build_object(
    'status', response_status,
    'confirmedAt', now(),
    'confirmedPasses', case when response_status = 'Confirmado' then attendees else 0 end,
    'notes', case
      when coalesce(guest_comment, '') = '' then coalesce(guest_row.payload ->> 'notes', '')
      else concat_ws(' | ', nullif(guest_row.payload ->> 'notes', ''), 'RSVP: ' || left(guest_comment, 500))
    end
  );

  update public.wedding_guests
  set payload = guest_data
  where user_id = guest_row.user_id and id = guest_row.id;

  return jsonb_build_object(
    'id', guest_data -> 'id',
    'name', guest_data -> 'name',
    'passes', guest_data -> 'passes',
    'status', guest_data -> 'status',
    'confirmedPasses', guest_data -> 'confirmedPasses',
    'token', guest_data -> 'token'
  );
end;
$$;

revoke all on function public.get_public_wedding_guest(text) from public;
revoke all on function public.submit_public_wedding_rsvp(text, text, integer, text) from public;
grant execute on function public.get_public_wedding_guest(text) to anon, authenticated;
grant execute on function public.submit_public_wedding_rsvp(text, text, integer, text) to anon, authenticated;
