-- A client approves on the proposal's own page, with no login: holding the link is the
-- permission, the same as for reading it. This is all the link can change, on that one
-- proposal. Returns false when the proposal no longer exists, so the page never reports
-- an approval that was not recorded.
create function public.approve_proposal(proposal_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with approved as (
    update public.proposals p
    set status = 'aprovada'
    where p.id = proposal_id
    returning 1
  )
  select exists (select 1 from approved);
$$;

revoke all on function public.approve_proposal(uuid) from public;
grant execute on function public.approve_proposal(uuid) to anon, authenticated;

-- The page also needs the stage, so a client coming back finds it already approved.
-- Dropped first because a function's return columns cannot be changed in place.
drop function public.get_proposal(uuid);

create function public.get_proposal(proposal_id uuid)
returns table (client text, site_type text, budget numeric, created_at timestamptz, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.client, p.site_type, p.budget, p.created_at, p.status
  from public.proposals p
  where p.id = proposal_id;
$$;

revoke all on function public.get_proposal(uuid) from public;
grant execute on function public.get_proposal(uuid) to anon, authenticated;
