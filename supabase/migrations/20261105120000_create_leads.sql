-- Contacts left on the public site's form before a visitor is shown the WhatsApp button.
-- The site is static and its publishable key ships in the browser, so the table stays
-- closed to anon: a visitor reaches it only through public.submit_lead below.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  source text not null default '' check (length(source) <= 80),
  created_at timestamptz not null default now()
);

create index leads_owner_created_idx on public.leads (owner_id, created_at desc);

alter table public.leads enable row level security;

revoke all on public.leads from anon;
grant select, delete on public.leads to authenticated;

create policy "Owner reads own leads" on public.leads
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owner deletes own leads" on public.leads
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- A visitor has no login, so the lead goes to the site's owner: the project's first account.
-- Signups are closed, and an account added later would not see these rows.
-- Inserts one row and reads nothing back; returns false if there is no account to own it.
create function public.submit_lead(lead_name text, lead_email text, lead_whatsapp text, lead_source text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with added as (
    insert into public.leads (owner_id, name, email, whatsapp, source)
    select u.id,
      trim(lead_name),
      lower(trim(lead_email)),
      regexp_replace(lead_whatsapp, '\D', '', 'g'),
      coalesce(trim(lead_source), '')
    from auth.users u
    order by u.created_at
    limit 1
    returning 1
  )
  select exists (select 1 from added);
$$;

revoke all on function public.submit_lead(text, text, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text) to anon, authenticated;
