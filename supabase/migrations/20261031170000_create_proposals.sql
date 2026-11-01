-- Commercial proposals. The site is static and its publishable key ships in the browser,
-- so the policy below is the only thing protecting this data.
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client text not null check (length(trim(client)) between 1 and 200),
  site_type text not null check (site_type in ('Landing Page', 'Site Institucional', 'E-commerce')),
  budget numeric(12, 2) not null check (budget >= 0),
  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviada', 'aprovada', 'recusada')),
  created_at timestamptz not null default now()
);

create index proposals_owner_created_idx on public.proposals (owner_id, created_at desc);

alter table public.proposals enable row level security;

revoke all on public.proposals from anon;
grant select, insert, update, delete on public.proposals to authenticated;

create policy "Owner manages own proposals" on public.proposals
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
