import React from "react";
import { clamp, hasFinePointer, onFrame, prefersReducedMotion } from "../lib/scroll.js";
import { DeviceFrame, crossing, deviceScreens, trackLength } from "../lib/device.jsx";
import { CLIENTS, DIFFS, FAQS, PROJECTS, STATS } from "../lib/offer.js";
import { Title, Words, useInView } from "../lib/title.jsx";
import { ApproveButton } from "./Approve.jsx";
import { Simulation } from "./Simulation.jsx";

const { useEffect, useRef, useState } = React;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const longDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

// The page moves like a camera: motion follows the reader's scroll instead of playing on its
// own, so these write the scroll position into --p and the stylesheet does the rest.
const entering = (rect, vh) => (vh * 0.92 - rect.top) / (vh * 0.55);
const passing = (rect, vh) => (vh * 0.62 - rect.top) / rect.height;

function useScrub(progress = entering) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (prefersReducedMotion()) {
      el.style.setProperty("--p", 1);
      return;
    }
    return onFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -vh || rect.top > vh * 1.5) return;
      el.style.setProperty("--p", clamp(progress(rect, vh)).toFixed(4));
    });
  }, []);
  return ref;
}

const hexagon = (cx, cy, r) => [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

function HexMark() {
  return (
    <svg className="hex-mark" viewBox="0 0 12 13" aria-hidden="true">
      <polygon points="6,.7 11.3,3.6 11.3,9.4 6,12.3 .7,9.4 .7,3.6" />
    </svg>);

}

// ─── HERO — a corridor of sites, seen through the lens ──────
export const HERO_PLATE = "../assets/proposta-hero.webp";

function Reticle() {
  return (
    <svg className="reticle" viewBox="0 0 600 600" aria-hidden="true">
      <circle className="ret-ticks" cx="300" cy="300" r="288" />
      <polygon className="ret-outer" points={hexagon(300, 300, 262)} pathLength="1" />
      <polygon className="ret-middle" points={hexagon(300, 300, 204)} pathLength="1" />
      <polygon className="ret-inner" points={hexagon(300, 300, 126)} pathLength="1" />
      <path className="ret-cross" d="M300 8v34M300 558v34M8 300h34M558 300h34" />
    </svg>);

}

export function Hero({ proposal, plan, reference, headingRef }) {
  const ref = useRef(null);
  const [pinned, setPinned] = useState(false);
  const { client, site_type: siteType } = proposal;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = ref.current;

    // Held in place while the camera travels, unless it is taller than the screen: pinned, the
    // data sheet at its foot would fade before anyone could read it.
    const fit = new ResizeObserver(() => setPinned(hero.offsetHeight <= window.innerHeight));
    fit.observe(hero);

    // The picture and the lens drift apart with the pointer: two planes out of a flat image.
    const aim = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    const onMove = (event) => {
      aim.x = (event.clientX / window.innerWidth - 0.5) * 2;
      aim.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (hasFinePointer()) window.addEventListener("pointermove", onMove, { passive: true });

    const off = onFrame((y) => {
      now.x += (aim.x - now.x) * 0.05;
      now.y += (aim.y - now.y) * 0.05;
      hero.style.setProperty("--out", clamp(y / (window.innerHeight * 0.85)).toFixed(4));
      hero.style.setProperty("--mx", now.x.toFixed(4));
      hero.style.setProperty("--my", now.y.toFixed(4));
    });

    return () => {
      off();
      fit.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const specs = [
    ...(plan ? [["Prazo", plan.summary[0]], ["Escopo", plan.summary[1]], ["Inclui", plan.summary[2]]] : []),
    ["Referência", reference],
  ];

  return (
    <div className={`hero-run${pinned ? " pinned" : ""}`}>
      <section className="prop-hero" id="inicio" data-chapter="Visão geral" ref={ref}>
        <div className="hero-plate" aria-hidden="true">
          <img src={HERO_PLATE} alt="" width="1672" height="941" />
        </div>

        <div className="hero-lens"><Reticle /></div>

        <div className="hero-brand">
          <img src="../assets/logo.webp" alt="" width="30" height="30" />
          <span>Giovanne Marrone</span>
        </div>

        <div className="hero-copy">
          <h1 ref={headingRef} tabIndex={-1}>Proposta para <em>{client}</em></h1>
          {plan && <p className="lead">{plan.desc}</p>}
          <p className="prop-by">{siteType}, preparada por Giovanne Marrone em {longDate.format(new Date(proposal.created_at))}</p>
        </div>

        <dl className="specs">
          {specs.map(([label, value]) =>
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>)}
        </dl>
      </section>
    </div>);

}

// ─── THE IDEA — words light up as the reader passes them ────
const FLOW = [
  { t: "Visita", d: "Alguém encontra você no Google ou numa campanha." },
  { t: "Interesse", d: "Copy e design seguram a atenção e comunicam autoridade." },
  { t: "Ação", d: "O visitante agenda, compra ou chama no WhatsApp." },
];

export function Idea({ client }) {
  const ref = useScrub((rect, vh) => (vh * 0.8 - rect.top) / (rect.height + vh * 0.2));
  const flowRef = useScrub();

  const lead = client.split(/\s+/);
  const rest = "eu não entrego site bonito. Entrego estrutura de conversão: cada elemento da página é pensado pra fazer o visitante tomar uma ação.".split(" ");
  const total = lead.length + rest.length;
  const word = (text, i, end = " ") =>
    <span className="lit" key={i} style={{ "--i": i / total }}>{text}{end}</span>;

  return (
    <section className="sec idea" id="ideia" data-chapter="A ideia">
      <div className="wrap">
        <p className="idea-text" ref={ref} style={{ "--n": total }}>
          <em>{lead.map((text, i) => word(text, i, i === lead.length - 1 ? "" : " "))}</em>
          <span className="lit" style={{ "--i": lead.length / total }}>, </span>
          {rest.map((text, i) => word(text, i + lead.length))}
        </p>

        <ol className="flow" ref={flowRef}>
          {FLOW.map((step, i) =>
            <li key={step.t} style={{ "--at": i / FLOW.length }}>
              <HexMark />
              <strong>{step.t}</strong>
              <span>{step.d}</span>
            </li>)}
        </ol>
      </div>
    </section>);

}

// ─── SCOPE — the client's site, running on a laptop and a phone ─
export function Scope({ plan, client }) {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  // Measured on the grid, which keeps moving while the laptop holds still: it lands closed, the
  // lid opens with the scroll, and the first item arrives as the screen lights up.
  const gridRef = useScrub((rect, vh) => (vh * 0.3 - rect.top) / (vh * 0.46));

  useEffect(() => {
    const items = [...listRef.current.children];
    return onFrame(() => {
      const vh = window.innerHeight;
      const line = vh * (window.innerWidth > 900 ? 0.5 : 0.72);
      let closest = 0;
      let distance = Infinity;
      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const away = Math.abs(rect.top + rect.height / 2 - line);
        if (away < distance) {
          distance = away;
          closest = i;
        }
      });
      setActive(closest);
    });
  }, []);

  return (
    <section className="sec scope" id="entrega" data-chapter="O que você recebe">
      <div className="wrap">
        <header className="scope-head">
          <Title text={plan.titles.scope} />
          <div>
            <p className="lead">Tudo o que entra no projeto, parte por parte. Role a página e veja onde cada item aparece.</p>
            <p className="scope-note">Simulação ilustrativa. O design do seu projeto é criado do zero.</p>
          </div>
        </header>

        {/* The model comes first so that on a phone it can stick above the list */}
        <div className="scope-grid" ref={gridRef}>
          <div className="scope-draw">
            <Simulation plan={plan} client={client} active={active} listRef={listRef} />
          </div>

          <ol className="scope-list" ref={listRef}>
            {plan.includes.map((item, i) =>
              <li className={active === i ? "on" : ""} key={item}>
                <h3>{item}</h3>
                {plan.details?.[i] && <p>{plan.details[i]}</p>}
              </li>)}
          </ol>
        </div>
      </div>
    </section>);

}

// ─── REEL — a travelling shot past work already online ──────
// Three sites: a longer reel would stand between the reader and the price.
const REEL = PROJECTS.slice(0, 3);

export function Reel() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const still = prefersReducedMotion();
    const pin = !still && window.matchMedia("(min-width: 901px)").matches;
    setPinned(pin);
    if (still) return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    let distance = 0;
    let shots = [];

    const measure = () => {
      shots = [...track.querySelectorAll(".shot")].map((shot) => {
        const frame = shot.querySelector(".shot-frame");
        return { frame, scroll: deviceScreens(frame), origin: shot.offsetLeft };
      });
      if (!pin) return;
      distance = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${trackLength(distance) + stage.offsetHeight}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));

    const off = onFrame(() => {
      const rect = section.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;

      let x = 0;
      if (pin) {
        const span = rect.height - stage.offsetHeight;
        if (span > 0) x = clamp(-rect.top / span) * distance;
        track.style.transform = `translate3d(${-x}px, 0, 0)`;
      }

      shots.forEach(({ frame, scroll, origin }) => {
        const box = frame.getBoundingClientRect();
        // Stacked on a phone, the site scrolls with the page instead. A card leaves faster that
        // way, so the site stops short of its end rather than rushing to reach it.
        scroll(pin ? crossing(origin - x, origin, box.width, vw) : crossing(box.top, vh, box.height, vh) * 0.75);
        const fromCenter = pin ? (box.left + box.width / 2 - vw / 2) / vw : (box.top + box.height / 2 - vh / 2) / vh;
        const away = Math.abs(fromCenter);
        frame.style.setProperty("--focus", (1 - clamp((away - 0.1) * 2.5)).toFixed(3));
        if (pin) {
          frame.style.setProperty("--dim", clamp((away - 0.28) * 1.1, 0, 0.5).toFixed(3));
          frame.style.setProperty("--drift", clamp(fromCenter, -0.6, 0.6).toFixed(3));
        }
      });
    });

    return () => {
      off();
      observer.disconnect();
      section.style.height = "";
    };
  }, []);

  return (
    <section className={`reel${pinned ? " pinned" : ""}`} id="projetos" data-chapter="Projetos" ref={sectionRef}>
      <div className="reel-stage" ref={stageRef}>
        <div className="reel-track" ref={trackRef}>
          <div className="reel-intro">
            <Title text="Sites reais, *resultados reais.*" />
            <p className="lead">Cada projeto foi pensado do zero pra atender o posicionamento do cliente e converter o público certo.</p>
          </div>

          {REEL.map((project) =>
            <article className="shot" key={project.img}>
              <DeviceFrame project={project} base="../" className="shot-frame" />
              <div className="shot-meta">
                <div>
                  <h3>{project.first} <em>{project.last}</em></h3>
                  <p className="shot-tags">{project.tags}</p>
                </div>
                <p className="shot-desc">{project.desc}</p>
              </div>
            </article>)}

          {/* Room for the last site to keep scrolling past the middle of the screen */}
          <div className="reel-next">
            <p>O próximo é <em>o seu.</em></p>
          </div>
        </div>
      </div>
    </section>);

}

// ─── AUTHOR — the camera finds focus on the person behind it ─
function Count({ to, prefix = "", suffix = "" }) {
  const [ref, inView] = useInView(0.5);
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let start = null;
    let raf;
    const step = (time) => {
      start ??= time;
      const p = Math.min((time - start) / 1500, 1);
      setValue(Math.round(to * (1 - (1 - p) ** 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return <strong ref={ref}>{prefix}{value}{suffix}</strong>;
}

export function Author() {
  const ref = useScrub();
  const diffsRef = useScrub();

  return (
    <section className="author" id="quem" data-chapter="Quem faz" ref={ref}>
      <figure className="author-photo">
        <picture>
          <source media="(max-width: 800px)" srcSet="../assets/giovanne-portrait-mobile.webp" type="image/webp" />
          <img src="../assets/giovanne-portrait.webp" alt="Giovanne Marrone, de braços cruzados, em um estúdio escuro" loading="lazy" decoding="async" />
        </picture>
        <svg className="focus" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M2 18V2h16M82 2h16v16M98 82v16H82M18 98H2V82" />
        </svg>
      </figure>

      <div className="wrap author-grid">
        <div className="author-copy">
          <Title text="Sou Giovanne, web designer focado em *resultado mensurável.*" />
          <p className="lead">Não vendo "presença digital". Vendo páginas que convertem visitante em cliente pagante.</p>
        </div>

        <ul className="diffs" ref={diffsRef}>
          {DIFFS.map((item, i) =>
            <li key={item.t} style={{ "--at": i * 0.2 }}>
              <h3><Words text={item.t} /></h3>
              <p>{item.d}</p>
            </li>)}
        </ul>

        <ul className="stats">
          {STATS.map((stat) =>
            <li key={stat.label}>
              <Count to={stat.to} prefix={stat.prefix} suffix={stat.suffix} />
              <span>{stat.label}</span>
            </li>)}
        </ul>
      </div>

      <div className="credits" aria-hidden="true">
        <ul>
          {[...CLIENTS, ...CLIENTS].map((client, i) =>
            <li key={`${client.name}${i}`}>
              <img src={`../${client.img}`} alt="" loading="lazy" width="36" height="36" />
              {client.name}
            </li>)}
        </ul>
      </div>
    </section>);

}

// ─── PATH — what happens from approval to launch ────────────
export function Path({ plan, deposit, balance }) {
  const ref = useScrub(passing);

  const steps = [
    { t: "Aprovação", d: "Você aprova aqui na proposta, recebe o contrato e paga os primeiros 50%.", pay: deposit },
    { t: "Alinhamento", d: "Entendo seu posicionamento, público e oferta. O prazo fica combinado por escrito." },
    { t: "Copy e design", d: "Escrevo o texto do zero e desenho o layout com a identidade do seu negócio." },
    { t: "Integrações e SEO", d: "Conecto suas ferramentas e deixo a estrutura técnica pronta pro Google." },
    { t: "Entrega", d: plan?.handover ?? "Você paga os outros 50% e seu projeto vai pro ar.", pay: balance },
  ];

  return (
    <section className="sec path" id="caminho" data-chapter="Como vai ser">
      <div className="wrap">
        <Title className="center" text={plan?.titles.path ?? "Do sim ao projeto *no ar*"} />
        {plan && <p className="path-total">{plan.summary[0]}. Todo prazo é alinhado antes do início, por escrito.</p>}

        <div className="steps" ref={ref}>
          <span className="steps-rail" aria-hidden="true"><i /></span>
          <ol>
            {steps.map((step, i) =>
              <li className="step" key={step.t} style={{ "--at": i / (steps.length - 1) * 0.92 }}>
                <span className="step-node" aria-hidden="true">{i + 1}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
                {step.pay !== undefined && <p className="step-pay">{brl.format(step.pay)}</p>}
              </li>)}
          </ol>
        </div>
      </div>
    </section>);

}

// ─── INVESTMENT ─────────────────────────────────────────────
function Amount({ value }) {
  const [ref, inView] = useInView(0.5);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let start = null;
    let raf;
    const step = (time) => {
      start ??= time;
      const p = Math.min((time - start) / 1800, 1);
      setShown(value * (1 - (1 - p) ** 4));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <p className={`amount${shown === value ? " settled" : ""}`} ref={ref}>
      <span className="sr-only">{brl.format(value)}</span>
      <span aria-hidden="true">{brl.format(shown)}</span>
    </p>);

}

const PROMISES = ["Sem taxas escondidas", "Sem mensalidades obrigatórias", "SEO incluso, sem custo extra"];

export function Investment({ budget, deposit, balance }) {
  const ref = useScrub();

  return (
    <section className="sec invest" id="investimento" data-chapter="Investimento" ref={ref}>
      <div className="invest-rings" aria-hidden="true">
        <svg viewBox="0 0 600 600">
          <polygon points={hexagon(300, 300, 292)} />
          <polygon points={hexagon(300, 300, 232)} />
          <polygon points={hexagon(300, 300, 170)} />
        </svg>
      </div>

      <div className="wrap">
        <Title className="center" text="Seu *investimento*" />
        <Amount value={budget} />

        <dl className="split">
          <div>
            <dt>50% na contratação</dt>
            <dd>{brl.format(deposit)}</dd>
          </div>
          <div>
            <dt>50% na entrega</dt>
            <dd>{brl.format(balance)}</dd>
          </div>
        </dl>

        <ul className="promises">
          {PROMISES.map((text) => <li key={text}><HexMark />{text}</li>)}
        </ul>
      </div>
    </section>);

}

// ─── DOUBTS ─────────────────────────────────────────────────
const DOUBTS = FAQS.filter((item) => /dependente|Wix|site atual/.test(item.q));

export function Doubts({ ask }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="sec doubts" id="duvidas" data-chapter="Dúvidas">
      <div className="wrap doubts-grid">
        <div>
          <Title text="Antes de *decidir*" />
          <p className="lead">Se a sua dúvida não está aqui, manda no WhatsApp.</p>
          <a className="btn btn-line" href={ask} target="_blank" rel="noopener">Tirar uma dúvida</a>
        </div>

        <div className="doubts-list">
          {DOUBTS.map((item, i) =>
            <div className={`doubt${open === i ? " open" : ""}`} key={item.q}>
              <h3>
                <button type="button" id={`doubt-q-${i}`} aria-expanded={open === i} aria-controls={`doubt-a-${i}`}
                  onClick={() => setOpen(open === i ? -1 : i)}>
                  {item.q}
                  <span aria-hidden="true" />
                </button>
              </h3>
              <div className="doubt-a" id={`doubt-a-${i}`} role="region" aria-labelledby={`doubt-q-${i}`}>
                <div><p>{item.a}</p></div>
              </div>
            </div>)}
        </div>
      </div>
    </section>);

}

// ─── FINALE — iris-out: the film closes on the decision ─────
export function Finale({ approval, ask }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (prefersReducedMotion()) {
      setStill(true);
      stage.style.setProperty("--e", 1);
      return;
    }
    return onFrame(() => {
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      const vh = stage.offsetHeight;
      const vw = stage.offsetWidth;
      const p = clamp(-rect.top / (rect.height - vh) + 0.06);
      const e = 1 - (1 - clamp(p / 0.86)) ** 3;
      const open = Math.hypot(vw, vh) / 2 + 80;
      const closed = Math.max(Math.min(vh * 0.46, vw * 0.42), 320);
      stage.style.setProperty("--r", `${open + (closed - open) * e}px`);
      stage.style.setProperty("--a", `${e * 60 - 30}deg`);
      stage.style.setProperty("--e", e.toFixed(4));
    });
  }, []);

  return (
    <section className={`close${still ? " still" : ""}`} id="fim" data-chapter="Vamos começar" ref={sectionRef}>
      <div className="close-stage" ref={stageRef}>
        <div className="close-copy">
          <span className="close-photo">
            <img src="../assets/about-portrait.webp" alt="" loading="lazy" width="104" height="120" />
          </span>
          {approval.approved ?
            <h2>Proposta <em className="yes">aprovada!</em></h2> :
            <h2>Vamos <em>começar?</em></h2>}
          <p className="lead">{approval.approved ?
            "Em breve você receberá o contrato para começarmos oficialmente o projeto." :
            "Aprovando agora, você recebe o contrato e a gente começa oficialmente o projeto."}</p>
          <div className="close-actions">
            <ApproveButton approval={approval} label="Aprovar proposta" done="Proposta aprovada" />
            <a className="btn btn-line" href={ask} target="_blank" rel="noopener">Tirar uma dúvida</a>
          </div>
          <small>Dúvidas respondidas em até 2 horas em horário comercial.</small>
        </div>
        {!still &&
          <div className="iris-blades" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => <span className="blade" key={i} style={{ "--i": i }} />)}
          </div>}
      </div>
    </section>);

}
