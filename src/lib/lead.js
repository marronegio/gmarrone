// The contact form on the site and the thank-you page after it. WhatsApp only appears on
// the thank-you page, once the visitor's contact is stored.
import { whatsapp } from "./offer.js";

const API = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Session storage: the tab forgets it, and the visitor's data never goes into a URL.
// obrigado/index.html checks the same key before the page paints.
const LEAD_KEY = "gm-lead";

export const ASK_PROPOSAL = "Quero uma proposta para o meu site.";

// Plain fetch, as on the proposal page: the public bundle stays free of the Supabase client.
export async function submitLead({ name, email, phone, source }) {
  const response = await fetch(`${API}/rest/v1/rpc/submit_lead`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ lead_name: name, lead_email: email, lead_whatsapp: phone, lead_source: source }),
  });
  if (!response.ok) throw new Error(`submit_lead: ${response.status}`);
  if (!(await response.json())) throw new Error("submit_lead: not stored");
}

export function saveLead(lead) {
  try {
    sessionStorage.setItem(LEAD_KEY, JSON.stringify(lead));
  } catch { /* blocked storage: the thank-you page then greets without a name */ }
}

export function readLead() {
  try {
    return JSON.parse(sessionStorage.getItem(LEAD_KEY));
  } catch {
    return null;
  }
}

export const firstName = (name) => name.trim().split(/\s+/)[0];

export const contactLink = (lead) => {
  const ask = lead?.ask ?? ASK_PROPOSAL;
  return whatsapp(lead?.name ? `Oi Giovanne, aqui é ${firstName(lead.name)}. ${ask}` : `Oi Giovanne! ${ask}`);
};
