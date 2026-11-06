import "./obrigado.css";
import { contactLink, firstName, readLead, saveLead } from "../lib/lead.js";
import { startPixel, trackLead } from "../lib/meta.js";

const lead = readLead();

startPixel();
// Once per form sent: a reload of this page must not count a second Lead.
if (lead?.eventId) {
  trackLead(lead.eventId);
  saveLead({ ...lead, eventId: null });
}

if (lead?.name) {
  const name = document.createElement("em");
  name.textContent = `${firstName(lead.name)}.`;
  document.querySelector("[data-greeting]").replaceChildren("Obrigado, ", name);
}

// The WhatsApp message opens with who is writing and what they asked for on the site.
document.querySelector("[data-whatsapp]").href = contactLink(lead);
