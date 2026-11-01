import React from "react";
import { onFrame } from "../lib/scroll.js";
import { PLANS, whatsapp } from "../lib/offer.js";
import { Author, Doubts, Finale, Hero, Idea, Investment, Path, Reel, Scope } from "./scenes.jsx";

const { useEffect, useRef, useState } = React;

// Reads where the reader is, for the bar at the top.
function useChapters(active) {
  const [chapter, setChapter] = useState({ index: 0, total: 1, label: "" });
  const barRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const scenes = [...document.querySelectorAll("[data-chapter]")];

    return onFrame((y) => {
      const vh = window.innerHeight;
      const end = document.documentElement.scrollHeight - vh;
      if (barRef.current) barRef.current.style.transform = `scaleX(${end > 0 ? y / end : 0})`;

      let index = 0;
      scenes.forEach((scene, i) => {
        if (scene.getBoundingClientRect().top < vh * 0.5) index = i;
      });
      setChapter((now) => (now.index === index && now.label ? now :
        { index, total: scenes.length, label: scenes[index].dataset.chapter }));
    });
  }, [active]);

  return [chapter, barRef];
}

export function Page({ proposal, revealing, headingRef }) {
  const { client, site_type: siteType } = proposal;
  const budget = Number(proposal.budget);
  const plan = PLANS.find((item) => item.name === siteType);
  const reference = window.location.hash.slice(1, 7).toUpperCase();

  // Half up front, rounded so the two payments always add up to the exact budget
  const deposit = Math.ceil(budget * 50) / 100;
  const balance = budget - deposit;

  const [chapter, barRef] = useChapters(!revealing);

  const approve = whatsapp(`Oi Giovanne, quero aprovar a proposta de ${siteType} para ${client}.`);
  const ask = whatsapp(`Oi Giovanne, tenho uma dúvida sobre a proposta de ${siteType} para ${client}.`);

  return (
    <div className={`prop${revealing ? " revealing" : ""}`}>
      <div className={`hud${chapter.index > 0 ? " on" : ""}`}>
        <img src="../assets/logo.webp" alt="" width="26" height="26" />
        <span className="hud-client">{client}</span>
        <span className="hud-chapter">{chapter.label}<small>{chapter.index + 1} de {chapter.total}</small></span>
        <a className="btn btn-small" href={approve} target="_blank" rel="noopener">Aprovar</a>
        <span className="hud-bar" aria-hidden="true"><i ref={barRef} /></span>
      </div>

      <main>
        <Hero proposal={proposal} plan={plan} reference={reference} headingRef={headingRef} />
        <Idea client={client} />
        {plan && <Scope plan={plan} />}
        <Reel />
        <Author />
        <Path plan={plan} deposit={deposit} balance={balance} />
        <Investment budget={budget} deposit={deposit} balance={balance} />
        <Doubts ask={ask} />
        <Finale approve={approve} ask={ask} />
      </main>

      <footer className="prop-foot">
        <div className="wrap">
          <img src="../assets/logo.webp" alt="" width="30" height="30" loading="lazy" />
          <span>Giovanne Marrone</span>
          <a href="mailto:admin@gmarrone.com.br">admin@gmarrone.com.br</a>
        </div>
      </footer>
    </div>);

}
