import "./obrigado.css";
import { contactLink, firstName, readLead } from "../lib/lead.js";

const lead = readLead();

if (lead?.name) {
  const name = document.createElement("em");
  name.textContent = `${firstName(lead.name)}.`;
  document.querySelector("[data-greeting]").replaceChildren("Obrigado, ", name);
}

// The WhatsApp message opens with who is writing and what they asked for on the site.
document.querySelector("[data-whatsapp]").href = contactLink(lead);
