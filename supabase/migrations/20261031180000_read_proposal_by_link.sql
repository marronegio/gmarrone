-- The page sent to a client has no login, and public.proposals stays closed to anon.
-- Whoever holds the link gets the fields of that one proposal and nothing else: the id
-- is a random uuid, so proposals cannot be listed or guessed, and deleting one ends its link.
create function public.get_proposal(proposal_id uuid)
returns table (client text, site_type text, budget numeric, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.client, p.site_type, p.budget, p.created_at
  from public.proposals p
  where p.id = proposal_id;
$$;

revoke all on function public.get_proposal(uuid) from public;
grant execute on function public.get_proposal(uuid) to anon, authenticated;
