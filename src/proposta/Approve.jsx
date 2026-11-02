import React from "react";
import { lockScroll, onFrame, prefersReducedMotion } from "../lib/scroll.js";
import { approveProposal } from "./api.js";

const { useCallback, useEffect, useRef, useState } = React;

// Shared by every approve button on the page. `notice` is what the dialog is showing:
// done, failed, gone, or null when it is closed.
export function useApproval(id, proposal) {
  const [approved, setApproved] = useState(proposal.status === "aprovada");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const approve = useCallback(async () => {
    if (approved) return setNotice("done");
    setBusy(true);
    try {
      const found = await approveProposal(id);
      setApproved(found);
      setNotice(found ? "done" : "gone");
    } catch {
      setNotice("failed");
    }
    setBusy(false);
  }, [approved, id]);

  return { approved, busy, notice, approve: busy ? () => {} : approve, dismiss: () => setNotice(null) };
}

// ─── Sparks ─────────────────────────────────────────────────
// A soft point of light, drawn once and stamped: far cheaper than a canvas shadow per mote.
function makeSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, "rgba(236, 255, 244, 1)");
  glow.addColorStop(0.18, "rgba(120, 255, 176, .95)");
  glow.addColorStop(0.46, "rgba(43, 255, 136, .32)");
  glow.addColorStop(1, "rgba(43, 255, 136, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 32, 32);
  return canvas;
}

// A point on the edge of a pill, walking clockwise from the top left, and which way is out.
function onPill(s, width, height) {
  const r = height / 2;
  const flat = Math.max(width - height, 0);
  const arc = Math.PI * r;
  let d = (((s % 1) + 1) % 1) * (flat * 2 + arc * 2);
  if (d < flat) return [r + d, 0, 0, -1];
  d -= flat;
  if (d < arc) {
    const a = -Math.PI / 2 + d / r;
    return [width - r + Math.cos(a) * r, r + Math.sin(a) * r, Math.cos(a), Math.sin(a)];
  }
  d -= arc;
  if (d < flat) return [width - r - d, height, 0, 1];
  d -= flat;
  const a = Math.PI / 2 + d / r;
  return [r + Math.cos(a) * r, r + Math.sin(a) * r, Math.cos(a), Math.sin(a)];
}

const between = (min, max) => min + Math.random() * (max - min);

// Motes stream around the edge and drift off it. Hovering or waiting stirs them up; once
// approved they fly outwards and no new ones are born. Runs only while the button is on screen.
function startSparks(canvas, button, state) {
  const context = canvas.getContext("2d");
  const sprite = makeSprite();
  const reach = parseFloat(getComputedStyle(canvas).getPropertyValue("--reach"));
  let width = 0;
  let height = 0;
  let perimeter = 1;
  let visible = false;
  let last = 0;
  let energy = 1;
  let motes = [];

  const born = (mote, anywhere) => {
    mote.s = Math.random();
    mote.drift = between(16, 40);
    mote.out = between(-1, 3);
    mote.rise = between(2, 10);
    mote.age = anywhere ? Math.random() * 2 : 0;
    mote.span = between(1.3, 3.2);
    mote.size = between(7, 16);
    mote.twinkle = Math.random() * 6.28;
    return mote;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = button.offsetWidth;
    height = button.offsetHeight;
    perimeter = Math.max(width - height, 0) * 2 + Math.PI * height;
    canvas.width = Math.round((width + reach * 2) * dpr);
    canvas.height = Math.round((height + reach * 2) * dpr);
    context.setTransform(dpr, 0, 0, dpr, reach, reach);
    context.translate(reach * (dpr - 1), reach * (dpr - 1));
    const count = Math.round(perimeter / 8);
    motes = state.approved ? [] : Array.from({ length: count }, () => born({}, true));
  };

  const sizes = new ResizeObserver(resize);
  sizes.observe(button);
  const sight = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "60px" });
  sight.observe(button);

  const off = onFrame((_, time) => {
    const dt = Math.min((time - last) / 1000, 0.05);
    last = time;
    if (!visible || document.hidden || !motes.length) return;

    const leaving = state.approved;
    const aim = leaving ? 7 : state.busy ? 4.5 : state.hover ? 2.6 : 1;
    energy += (aim - energy) * 0.09;

    context.clearRect(-reach, -reach, width + reach * 2, height + reach * 2);
    context.globalCompositeOperation = "lighter";

    motes = motes.filter((mote) => {
      mote.age += dt;
      if (mote.age > mote.span) {
        if (leaving) return false;
        born(mote);
      }
      mote.s += (mote.drift * energy * dt) / perimeter;
      mote.out += mote.rise * energy * dt;

      const [x, y, nx, ny] = onPill(mote.s, width, height);
      const fade = Math.sin((mote.age / mote.span) * Math.PI);
      const near = Math.max(1 - mote.out / reach, 0) ** 0.8; // gone before reaching the text around it
      context.globalAlpha = Math.max(fade * near * (0.62 + Math.sin(time * 0.006 + mote.twinkle) * 0.38), 0);
      const size = mote.size * (0.7 + Math.min(energy, 3) * 0.16);
      context.drawImage(sprite, x + nx * mote.out - size / 2, y + ny * mote.out - size / 2, size, size);
      return true;
    });
    if (!motes.length) context.clearRect(-reach, -reach, width + reach * 2, height + reach * 2);
  });

  return () => {
    off();
    sizes.disconnect();
    sight.disconnect();
  };
}

// ─── The button ─────────────────────────────────────────────
export function ApproveButton({ approval, label, done, small }) {
  const { approved, busy, approve } = approval;
  const canvasRef = useRef(null);
  const buttonRef = useRef(null);
  const stateRef = useRef({ hover: false });
  stateRef.current.approved = approved;
  stateRef.current.busy = busy;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    return startSparks(canvasRef.current, buttonRef.current, stateRef.current);
  }, []);

  const hover = (on) => () => { stateRef.current.hover = on; };

  return (
    <span className={`go${small ? " go-small" : ""}${approved ? " done" : ""}`}>
      <button className={`btn btn-go${small ? " btn-small" : ""}`} type="button" ref={buttonRef}
        aria-busy={busy} onClick={approve} onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
        {approved &&
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
        {busy ? "Aprovando…" : approved ? done : label}
      </button>
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>);

}

// ─── The dialog ─────────────────────────────────────────────
export function ApprovalDialog({ approval, oops, contact }) {
  const { notice, busy, approve, dismiss } = approval;
  const dialogRef = useRef(null);

  // The native dialog brings focus, Esc and the inert page; Lenis needs telling on its own.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (notice && !dialog.open) {
      dialog.showModal();
      lockScroll(true);
    }
    if (!notice && dialog.open) dialog.close();
  }, [notice]);

  const onClose = () => {
    lockScroll(false);
    dismiss();
  };

  return (
    <dialog className="approval" ref={dialogRef} aria-labelledby="approval-title" onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      {notice === "done" &&
        <div className="approval-card">
          <svg className="approval-mark" viewBox="0 0 100 100" aria-hidden="true">
            <polygon pathLength="1" points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
            <path pathLength="1" d="M33 51l12 12 23-25" />
          </svg>
          <h2 id="approval-title">Proposta <em>aprovada!</em></h2>
          <p className="lead">Em breve você receberá o contrato para começarmos oficialmente o projeto.</p>
          <button className="btn" type="button" onClick={() => dialogRef.current.close()}>Entendi</button>
          <a className="approval-oops" href={oops} target="_blank" rel="noopener">Aprovou sem querer? Me avise no WhatsApp.</a>
        </div>}

      {notice === "failed" &&
        <div className="approval-card">
          <h2 id="approval-title">Sua aprovação não foi registrada.</h2>
          <p className="lead">Verifique sua conexão e tente de novo.</p>
          <button className="btn" type="button" aria-busy={busy} onClick={approve}>{busy ? "Tentando…" : "Tentar de novo"}</button>
          <button className="approval-oops" type="button" onClick={() => dialogRef.current.close()}>Fechar</button>
        </div>}

      {notice === "gone" &&
        <div className="approval-card">
          <h2 id="approval-title">Esta proposta não está mais disponível.</h2>
          <p className="lead">Fale com Giovanne para receber um novo link.</p>
          <a className="btn" href={contact} target="_blank" rel="noopener">Falar com Giovanne</a>
          <button className="approval-oops" type="button" onClick={() => dialogRef.current.close()}>Fechar</button>
        </div>}
    </dialog>);

}
