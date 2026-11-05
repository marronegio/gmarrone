// Meta Pixel (browser) and Conversions API (server, through the meta-lead Supabase function).
// Both send the same Lead with the same event id, so Meta counts it once.
// Without VITE_META_PIXEL_ID the site runs as before and nothing is sent to Meta.
const PIXEL = import.meta.env.VITE_META_PIXEL_ID;
const API = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Meta's own loader, unchanged except that it runs only when a pixel id is set.
export function startPixel() {
  if (!PIXEL || window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq("init", PIXEL);
  window.fbq("track", "PageView");
}

export const newEventId = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function trackLead(eventId) {
  if (!PIXEL || !window.fbq) return;
  window.fbq("track", "Lead", { content_name: "Formulário de contato" }, { eventID: eventId });
}

function cookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

// _fbc is written by the pixel when the visit came from an ad (fbclid in the URL).
// If the pixel was blocked, it is rebuilt from the URL in the format Meta documents.
function clickId() {
  const stored = cookie("_fbc");
  if (stored) return stored;
  const fbclid = new URLSearchParams(location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : "";
}

// Fire and forget: keepalive lets the request finish while the page goes to /obrigado/.
export function sendServerLead(eventId, { name, email, phone, source }) {
  if (!PIXEL) return;
  fetch(`${API}/functions/v1/meta-lead`, {
    method: "POST",
    keepalive: true,
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      name, email, phone, source,
      url: location.href,
      fbp: cookie("_fbp"),
      fbc: clickId(),
    }),
  }).catch(() => { /* the browser Lead still counts */ });
}
