import React from "react";
import { lockScroll, prefersReducedMotion } from "../lib/scroll.js";
import { whatsapp } from "../lib/offer.js";
import { createField, envelopeOutline } from "./field.js";
import { Envelope } from "./Envelope.jsx";
import { Page } from "./Page.jsx";

const { useCallback, useEffect, useRef, useState } = React;

const API = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const UUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

// Plain fetch: a client's first impression should not wait for the whole Supabase client.
async function fetchProposal(id) {
  const response = await fetch(`${API}/rest/v1/rpc/get_proposal`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ proposal_id: id }),
  });
  if (!response.ok) throw new Error(`get_proposal: ${response.status}`);
  const [proposal] = await response.json();
  return proposal ?? null;
}

function Notice({ failed, onRetry }) {
  return (
    <div className="notice">
      <img src="../assets/logo.webp" alt="" width="44" height="44" />
      <h1>{failed ? "Não foi possível abrir a proposta." : "Esta proposta não está mais disponível."}</h1>
      <p>{failed ? "Verifique sua conexão e tente de novo." : "Fale com Giovanne para receber um novo link."}</p>
      {failed ?
        <button className="btn" type="button" onClick={onRetry}>Tentar de novo</button> :
        <a className="btn" href={whatsapp("Oi Giovanne, o link da minha proposta não abriu.")} target="_blank" rel="noopener">
          Falar com Giovanne
        </a>}
    </div>);

}

export default function App() {
  const [proposal, setProposal] = useState(undefined); // undefined while loading, null if gone
  const [failed, setFailed] = useState(false);
  const [formed, setFormed] = useState(false);
  const [phase, setPhase] = useState("sealed"); // sealed, open, leaving, reading
  const [field, setField] = useState(null);

  const canvasRef = useRef(null);
  const envelopeRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const created = createField(canvasRef.current, { still: prefersReducedMotion() });
    created?.fadeIn();
    setField(created);
    return () => created?.destroy();
  }, []);

  const load = useCallback(async () => {
    const id = window.location.hash.slice(1);
    setFailed(false);
    if (!UUID.test(id)) return setProposal(null);
    try {
      setProposal(await fetchProposal(id));
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reading = phase === "reading";
  useEffect(() => {
    lockScroll(!reading);
    if (!reading) return;
    headingRef.current?.focus({ preventScroll: true });
    field?.destroy(); // the particles end with the opening, the page reads on a still background
  }, [reading, field]);

  // Dust gathers into the envelope's outline, the envelope appears inside it, the dust lets go.
  useEffect(() => {
    if (!proposal) return;
    document.title = `Proposta para ${proposal.client}`;

    let cancelled = false;
    const timers = [];
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const patience = new Promise((resolve) => { timers.push(setTimeout(resolve, 900)); });

    Promise.race([fontsReady, patience]).then(() => {
      if (cancelled) return;
      if (!field || field.still) return setFormed(true);
      field.form(envelopeOutline(envelopeRef.current.getBoundingClientRect(), field.count), 1500);
      timers.push(setTimeout(() => setFormed(true), 1300));
      timers.push(setTimeout(() => field.release(1500), 2000));
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [proposal, field]);

  const open = () => {
    if (!formed || phase !== "sealed") return;
    setPhase("open");
    const seal = envelopeRef.current.querySelector(".env-seal").getBoundingClientRect();
    field?.shock(seal.left + seal.width / 2, seal.top + seal.height / 2);
  };

  const show = () => {
    setPhase("leaving");
    field?.warp();
    setTimeout(() => setPhase("reading"), prefersReducedMotion() ? 500 : 1800);
  };

  const unavailable = proposal === null || failed;

  return (
    <>
      {!reading && <canvas className="field" ref={canvasRef} aria-hidden="true" />}
      <div className="grain" aria-hidden="true" />

      {proposal && (phase === "leaving" || reading) &&
        <Page proposal={proposal} revealing={!reading} headingRef={headingRef} />}

      {!reading &&
        <div className="scene" data-phase={phase}>
          {unavailable && <Notice failed={failed} onRetry={load} />}
          {proposal === undefined && !failed && <p className="waiting" role="status">Preparando sua proposta…</p>}
          {proposal &&
            <div className="stage">
              <Envelope client={proposal.client} formed={formed} open={phase !== "sealed"}
                rootRef={envelopeRef} onOpen={open} onShow={show} />
              <p className="hint">
                <span className="hint-mouse">Passe o mouse no envelope</span>
                <span className="hint-touch">Toque no envelope</span>
              </p>
            </div>}
        </div>}

      {phase === "leaving" &&
        <svg className="iris-rim" viewBox="0 0 100 100" aria-hidden="true">
          <polygon className="rim-glow" points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
          <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
        </svg>}
    </>);

}
