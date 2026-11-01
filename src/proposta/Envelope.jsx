import React from "react";
import { hasFinePointer, onFrame, prefersReducedMotion } from "../lib/scroll.js";

const { useEffect, useRef } = React;

// Long names step down in size so the title always stays on the envelope's face.
const nameSize = (name) => (name.length > 46 ? "tiny" : name.length > 24 ? "small" : "");

export function Envelope({ client, formed, open, rootRef, onOpen, onShow }) {
  const tiltRef = useRef(null);
  const showRef = useRef(null);

  // The envelope leans towards the pointer.
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const tilt = tiltRef.current;
    const aim = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    const onMove = (event) => {
      aim.x = (event.clientX / window.innerWidth - 0.5) * 2;
      aim.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const off = onFrame(() => {
      now.x += (aim.x - now.x) * 0.06;
      now.y += (aim.y - now.y) * 0.06;
      tilt.style.transform = `rotateX(${-now.y * 7}deg) rotateY(${now.x * 9}deg)`;
    });
    return () => {
      off();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Moving, not just entering: the pointer may already rest here when the envelope forms.
  const onPointerMove = (event) => {
    if (event.pointerType === "mouse") onOpen();
  };

  // A tap or click opens it; from the keyboard (detail 0), focus follows to the new button.
  const onHit = (event) => {
    onOpen();
    if (event.detail === 0) requestAnimationFrame(() => showRef.current?.focus());
  };

  return (
    <div className={`envelope${formed ? " formed" : ""}${open ? " open" : ""}`} ref={rootRef}
      onPointerMove={onPointerMove}>
      <div className="env-tilt" ref={tiltRef}>
        <span className="env-beam" aria-hidden="true" />
        <span className="env-back" aria-hidden="true" />

        <div className="letter">
          <img src="../assets/logo.webp" alt="" width="40" height="40" />
          <button className="letter-btn" type="button" ref={showRef} tabIndex={open ? 0 : -1} onClick={onShow}>
            Exibir proposta
          </button>
        </div>

        <div className="env-front">
          <h1>
            <span>Proposta para</span>{" "}
            <em className={nameSize(client)}>{client}</em>
          </h1>
        </div>
        <svg className="env-folds" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 200 150 100 300 200" />
        </svg>

        <span className="env-flap" aria-hidden="true">
          <span className="env-flap-face">
            <svg viewBox="0 0 300 112" preserveAspectRatio="none">
              <path d="M0 0 150 112 300 0" />
            </svg>
          </span>
        </span>

        <span className="env-seal" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <polygon className="seal-ring" points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27" />
            <polygon points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27" />
          </svg>
          <img src="../assets/logo.webp" alt="" />
        </span>

        <span className="env-edge" aria-hidden="true" />

        {!open &&
          <button className="env-hit" type="button" disabled={!formed} onClick={onHit}
            aria-label={`Abrir o envelope da proposta para ${client}`} />}
      </div>
    </div>);

}
