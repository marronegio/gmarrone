// Server half of the site's Lead: sends it to Meta's Conversions API, with the same
// event id as the browser Pixel, so ad blockers and iOS do not hide leads from the ads.
//
// Called by the public site with only the publishable key (verify_jwt is off in
// config.toml). To keep strangers from sending made-up Leads, it only forwards a Lead
// whose e-mail was stored by submit_lead in the last 15 minutes.
//
// Secrets (supabase secrets set): META_PIXEL_ID, META_ACCESS_TOKEN,
// optional META_TEST_EVENT_CODE while testing in Events Manager.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.

const GRAPH = "https://graph.facebook.com/v24.0";
const ORIGINS = ["https://gmarrone.com.br", "https://www.gmarrone.com.br"];

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && (ORIGINS.includes(origin) || origin.startsWith("http://localhost:")) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "apikey, content-type, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Meta wants plain lowercase letters for names, and the phone with its country code.
const plainName = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

async function leadWasStored(email: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const url = new URL(`${Deno.env.get("SUPABASE_URL")}/rest/v1/leads`);
  url.searchParams.set("select", "id");
  url.searchParams.set("email", `eq.${email}`);
  url.searchParams.set("created_at", `gte.${since}`);
  url.searchParams.set("limit", "1");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const response = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return response.ok && (await response.json()).length > 0;
}

Deno.serve(async (request) => {
  const headers = cors(request.headers.get("origin"));
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return new Response("method not allowed", { status: 405, headers });

  const pixel = Deno.env.get("META_PIXEL_ID");
  const token = Deno.env.get("META_ACCESS_TOKEN");
  if (!pixel || !token) return new Response("not configured", { status: 503, headers });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response("bad json", { status: 400, headers });
  }

  const eventId = clean(body.event_id, 64);
  const email = clean(body.email, 254).toLowerCase();
  const name = clean(body.name, 120);
  let phone = clean(body.phone, 20).replace(/\D/g, "");
  if (!eventId || !email.includes("@")) return new Response("missing fields", { status: 400, headers });
  if (phone && !phone.startsWith("55")) phone = `55${phone}`;

  if (!(await leadWasStored(email))) return new Response("unknown lead", { status: 404, headers });

  const [first, ...rest] = name.split(/\s+/);
  const userData: Record<string, unknown> = {
    em: [await sha256(email)],
    country: [await sha256("br")],
    client_user_agent: request.headers.get("user-agent") ?? undefined,
    client_ip_address: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  if (phone) userData.ph = [await sha256(phone)];
  if (first && plainName(first)) userData.fn = [await sha256(plainName(first))];
  if (rest.length && plainName(rest.at(-1)!)) userData.ln = [await sha256(plainName(rest.at(-1)!))];
  const fbp = clean(body.fbp, 200);
  const fbc = clean(body.fbc, 500);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload: Record<string, unknown> = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: clean(body.url, 1000) || ORIGINS[0],
      user_data: userData,
      custom_data: { content_name: "Formulário de contato", lead_source: clean(body.source, 80) },
    }],
  };
  const testCode = Deno.env.get("META_TEST_EVENT_CODE");
  if (testCode) payload.test_event_code = testCode;

  const meta = await fetch(`${GRAPH}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!meta.ok) {
    console.error("meta-lead: Conversions API refused", meta.status, await meta.text());
    return new Response("meta refused", { status: 502, headers });
  }
  return new Response(null, { status: 204, headers });
});
