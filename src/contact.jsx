import React from "react";
import { holdFrames, lockScroll } from "./lib/scroll.js";
import { contactLink, saveLead, submitLead } from "./lib/lead.js";

const { useEffect, useRef, useState } = React;

// Written as the visitor types: (51) 99657-4342. A pasted +55 is dropped.
function phoneMask(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits && `(${digits}`;
  const local = digits.slice(2);
  const split = local.length > 8 ? 5 : 4;
  const head = `(${digits.slice(0, 2)}) ${local.slice(0, split)}`;
  return local.length > split ? `${head}-${local.slice(split)}` : head;
}

// ─── CONTACT — every contact button opens this form first ───
// The buttons carry data-lead (where on the page) and data-ask (the first WhatsApp line),
// and one listener serves them all, as the cursor does with data-cursor.
export function ContactDialog() {
  const dialogRef = useRef(null);
  const downOnBackdrop = useRef(false);
  const [topic, setTopic] = useState({ source: "", ask: "" });
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onClick = (event) => {
      const button = event.target.closest?.("[data-lead]");
      if (!button) return;
      event.preventDefault();
      setTopic({ source: button.dataset.lead, ask: button.dataset.ask });
      setFailed(false);
      if (!dialogRef.current.open) {
        dialogRef.current.showModal();
        lockScroll(true);
        holdFrames(true);
      }
    };
    // Coming back from the thank-you page restores this page as it was left: mid-send.
    const onShow = (event) => {
      if (!event.persisted) return;
      setBusy(false);
      dialogRef.current.close();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  const onClose = () => {
    lockScroll(false);
    holdFrames(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const lead = { name: fields.name.trim(), email: fields.email.trim(), phone: phone.replace(/\D/g, ""), source: topic.source };
    setBusy(true);
    setFailed(false);
    try {
      if (!fields.company) await submitLead(lead); // only bots fill the hidden field
    } catch {
      setBusy(false);
      setFailed(true);
      return;
    }
    saveLead({ name: lead.name, ask: topic.ask });
    window.location.assign("obrigado/");
  };

  // A drag that starts in a field and ends on the backdrop must not close the form.
  const onPointerDown = (event) => { downOnBackdrop.current = event.target === dialogRef.current; };
  const onClick = (event) => {
    if (downOnBackdrop.current && event.target === dialogRef.current) dialogRef.current.close();
  };

  return (
    <dialog className="contact" ref={dialogRef} aria-labelledby="contact-title" data-lenis-prevent
      onClose={onClose} onPointerDown={onPointerDown} onClick={onClick}>
      <form className="contact-card" onSubmit={submit}>
        <div className="aura" aria-hidden="true"><i /></div>
        <button className="contact-x" type="button" aria-label="Fechar" onClick={() => dialogRef.current.close()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
        </button>

        <h2 id="contact-title">Vamos <em>conversar</em></h2>
        <p className="contact-intro">Me passa seu contato. Na próxima tela você já pode me chamar no WhatsApp.</p>

        <label className="contact-field">
          <span>Nome</span>
          <input name="name" autoComplete="name" required maxLength={120} pattern=".*\S.*"
            title="Informe seu nome" />
        </label>
        <label className="contact-field">
          <span>E-mail</span>
          <input type="email" name="email" autoComplete="email" autoCapitalize="none" spellCheck="false"
            required maxLength={254} />
        </label>
        <label className="contact-field">
          <span>WhatsApp</span>
          <input type="tel" name="phone" autoComplete="tel-national" inputMode="tel" required
            placeholder="(51) 99999-9999" pattern="\(\d{2}\) \d{4,5}-\d{4}" title="Informe o WhatsApp com DDD"
            value={phone} onChange={(event) => setPhone(phoneMask(event.target.value))} />
        </label>
        <label className="contact-trap" aria-hidden="true">
          Empresa <input name="company" tabIndex={-1} autoComplete="off" />
        </label>

        {failed &&
          <p className="contact-error" role="alert">
            Não consegui enviar seus dados. Confira a conexão e tente de novo, ou{" "}
            <a href={contactLink({ ask: topic.ask })} target="_blank" rel="noopener">me chama direto no WhatsApp</a>.
          </p>}

        <button className="btn btn-solid" type="submit" disabled={busy}>
          {busy ? "Enviando…" : "Continuar pro WhatsApp"}
        </button>
        <p className="contact-note">Uso esses dados só pra te responder.</p>
      </form>
    </dialog>);

}
