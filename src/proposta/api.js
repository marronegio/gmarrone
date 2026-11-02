const API = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Plain fetch: a client's first impression should not wait for the whole Supabase client.
async function rpc(name, proposalId) {
  const response = await fetch(`${API}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ proposal_id: proposalId }),
  });
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return response.json();
}

export async function fetchProposal(id) {
  const [proposal] = await rpc("get_proposal", id);
  return proposal ?? null;
}

// True once the approval is stored, false if the proposal no longer exists.
export const approveProposal = (id) => rpc("approve_proposal", id);
