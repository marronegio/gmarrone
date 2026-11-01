import React from "react";
import { clamp, hasFinePointer, lockScroll, onFrame, prefersReducedMotion, scrollToY } from "./lib/scroll.js";
import { createHeroGL } from "./lib/heroGL.js";
import { DeviceFrame, crossing, deviceScreens, trackLength } from "./lib/device.jsx";
import { CLIENTS, DIFFS, FAQS, PAYMENT_TERMS, PLANS, PROJECTS, STATS, whatsapp } from "./lib/offer.js";
import { Title, Words, useInView } from "./lib/title.jsx";

const { useState, useEffect, useLayoutEffect, useRef } = React;

// ─── Helpers ────────────────────────────────────────────────
const PROPOSAL_LINK = whatsapp("Oi Giovanne, quero solicitar uma proposta para o meu site.");

function CountUp({ to, prefix = "", suffix = "", duration = 1500 }) {
  const [ref, inView] = useInView(0.5);
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let start = null;
    let raf;
    const step = (time) => {
      start ??= time;
      const p = Math.min((time - start) / duration, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  return <span ref={ref}>{prefix}{value}{suffix}</span>;
}

const ICONS = {
  check: "M5 12.5l4.2 4.2L19 7",
  x: "M7 7l10 10M17 7L7 17",
  plus: "M12 6v12M6 12h12",
  lock: "M7.5 11V8a4.5 4.5 0 0 1 9 0v3M6.5 11h11v9h-11z",
  whatsapp: "M12 21a9 9 0 1 0-7.8-4.5L3 21l4.6-1.2A9 9 0 0 0 12 21z",
};
function Icon({ name, className = "" }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>);

}

// Six half-planes around a hexagonal hole: the camera iris, the same hexagon as the logo.
function Blades() {
  return (
    <div className="iris-blades" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => <span className="blade" key={i} style={{ "--i": i }} />)}
    </div>);

}

const easeInOut = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);

// Read once per page load: StrictMode runs effects twice, and the intro plays once a session.
let introSeen = null;
function hasSeenIntro() {
  if (introSeen !== null) return introSeen;
  try {
    introSeen = sessionStorage.getItem("gm-intro") === "1";
    sessionStorage.setItem("gm-intro", "1");
  } catch {
    introSeen = false;
  }
  return introSeen;
}

// ─── INTRO — the lens opens ─────────────────────────────────
export function Intro({ onReveal }) {
  const [done, setDone] = useState(false);
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (hasSeenIntro() || prefersReducedMotion()) {
      onReveal();
      setDone(true);
      return;
    }

    lockScroll(true);
    const root = rootRef.current;
    const reach = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 60;
    let raf;
    let revealed = false;
    let start = null;

    const open = (time) => {
      start ??= time;
      const p = Math.min((time - start) / 1500, 1);
      const e = easeInOut(p);
      root.style.setProperty("--r", `${e * reach}px`);
      root.style.setProperty("--a", `${30 + e * 60}deg`);
      if (p > 0.32 && !revealed) {
        revealed = true;
        onReveal();
      }
      if (p < 1) raf = requestAnimationFrame(open);
      else {
        lockScroll(false);
        setDone(true);
      }
    };

    const delay = setTimeout(() => {
      root.classList.add("opening");
      raf = requestAnimationFrame(open);
    }, 1150);

    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
      lockScroll(false);
    };
  }, []);

  if (done) return null;
  return (
    <div className="intro" ref={rootRef}>
      <Blades />
      <div className="intro-mark" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <polygon points="50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5" pathLength="1" />
        </svg>
        <img src="assets/logo.webp" alt="" />
      </div>
    </div>);

}

// ─── CURSOR — a ring that names what a click will do ────────
export function Cursor() {
  const ref = useRef(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
    const target = { x: -100, y: -100 };
    const position = { x: -100, y: -100 };
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const hit = e.target.closest?.("[data-cursor]");
      setLabel(hit ? hit.dataset.cursor : "");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const off = onFrame(() => {
      position.x += (target.x - position.x) * 0.2;
      position.y += (target.y - position.y) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    });
    return () => {
      off();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className={`cursor${label ? " has-label" : ""}`} ref={ref} aria-hidden="true">
      <span>{label}</span>
    </div>);

}

// ─── NAV ────────────────────────────────────────────────────
const LINKS = [
["Projetos", "#projetos"],
["Serviços", "#servicos"],
["Planos", "#planos"],
["Sobre", "#sobre"],
["FAQ", "#faq"]];


export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => onFrame((y) => {
    setScrolled(y > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${open ? " open" : ""}`}>
      <a className="skip" href="#projetos">Ir para o conteúdo</a>
      <div className="wrap nav-inner">
        <a href="#" className="brand" aria-label="Giovanne Marrone, voltar ao início">
          <img src="assets/logo.webp" alt="" width="34" height="34" />
          <span>Giovanne Marrone</span>
        </a>
        <nav className="nav-links" aria-label="Principal">
          {LINKS.map(([label, href]) =>
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          )}
        </nav>
        <div className="nav-end">
          <span className="status"><i />Disponível</span>
          <a href="#contato" className="btn btn-line btn-sm">Contato</a>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
      <div className="nav-bar" ref={barRef} aria-hidden="true" />
    </header>);

}

// ─── HERO ───────────────────────────────────────────────────
export function Hero({ revealed }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mobile = window.matchMedia("(max-width: 800px)").matches;
    let cancelled = false;
    createHeroGL(canvasRef.current, {
      src: mobile ? "assets/giovanne-portrait-mobile.webp" : "assets/giovanne-portrait.webp",
      focus: mobile ? [0.5, 1] : [0.82, 1],
      fine: hasFinePointer(),
    }).then((gl) => {
      if (!gl) return;
      if (cancelled) return gl.destroy();
      glRef.current = gl;
      setLive(true);
    }).catch(() => { /* the <img> underneath remains */ });
    return () => {
      cancelled = true;
      glRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (revealed && live) glRef.current?.play();
  }, [revealed, live]);

  return (
    <section className={`hero${revealed ? " on" : ""}`} id="topo">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 800px)" srcSet="assets/giovanne-portrait-mobile.webp" type="image/webp" />
          <img src="assets/giovanne-portrait.webp" alt="" fetchpriority="high" decoding="async" />
        </picture>
        <canvas ref={canvasRef} className={live ? "live" : ""} />
      </div>
      <div className="wrap hero-body">
        <h1 className="hero-title">
          <Words text="Sites que *vendem* enquanto você atende seus clientes" />
        </h1>
        <p className="hero-sub">
          Sites, landing pages e e-commerces com copy estratégica, design profissional e SEO incluso — a mesma estrutura que aumentou em mais de 20% a conversão de grandes players do digital.
        </p>
        <div className="hero-actions">
          <a href="#projetos" className="btn btn-line">Projetos</a>
          <a href={PROPOSAL_LINK} target="_blank" rel="noopener" className="btn btn-solid">Solicitar proposta</a>
        </div>
        <div className="trust">
          <div className="trust-faces">
            {CLIENTS.map((c) =>
            <img key={c.name} src={c.img} alt={c.name} title={c.name} width="40" height="40" />
            )}
          </div>
          <p><strong>+30 profissionais</strong> já confiaram</p>
        </div>
      </div>
      <p className="hero-signature">
        <strong>Giovanne Marrone</strong>
        Web designer especialista em conversão
      </p>
      <span className="hero-scroll" aria-hidden="true"><i /></span>
    </section>);

}

// ─── PROJECTS — pinned horizontal gallery ───────────────────
export function Projects() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPinned(false);
      return;
    }
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    let distance = 0;
    let cards = [];

    const measure = () => {
      distance = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${trackLength(distance) + stage.offsetHeight}px`;
      cards = [...track.querySelectorAll("[data-card]")].map((el) => {
        const frame = el.querySelector(".work-frame");
        return { frame, scroll: deviceScreens(frame), left: el.offsetLeft, width: el.offsetWidth };
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(stage);
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));

    const off = onFrame(() => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - stage.offsetHeight;
      if (span <= 0 || rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const p = clamp(-rect.top / span);
      const x = p * distance;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      const vw = window.innerWidth;
      cards.forEach((c) => {
        const left = c.left - x;
        c.scroll(crossing(left, c.left, c.width, vw));
        const fromCenter = (left + c.width / 2 - vw / 2) / vw;
        const away = Math.abs(fromCenter);
        c.frame.style.transform = `scale(${1 - clamp(away - 0.12, 0, 0.6) * 0.14})`;
        c.frame.style.setProperty("--dim", clamp((away - 0.28) * 1.1, 0, 0.5));
        c.frame.style.setProperty("--focus", (1 - clamp((away - 0.1) * 2.5)).toFixed(3));
        c.frame.style.setProperty("--drift", clamp(fromCenter, -0.6, 0.6).toFixed(3));
      });
    });

    return () => {
      off();
      observer.disconnect();
      section.style.height = "";
    };
  }, []);

  // Keyboard focus must not leave a card off screen inside the clipped track.
  const onFocus = (event) => {
    if (!pinned) return;
    const card = event.target.closest("[data-card]");
    if (!card) return;
    const section = sectionRef.current;
    const span = section.offsetHeight - stageRef.current.offsetHeight;
    const distance = trackRef.current.scrollWidth - window.innerWidth;
    if (distance <= 0) return;
    const center = card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2;
    const top = section.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + span * clamp(center / distance));
  };

  return (
    <section className={`works${pinned ? " pinned" : ""}`} id="projetos" ref={sectionRef}>
      <div className="works-stage" ref={stageRef}>
        <div className="works-track" ref={trackRef} onFocus={onFocus}>
          <div className="works-intro">
            <Title text="Sites reais, *resultados reais.*" />
            <p className="lead">
              Conheça algumas pessoas que confiaram no meu trabalho. Cada projeto foi pensado do zero pra atender o posicionamento do cliente e converter o público certo.
            </p>
          </div>

          {PROJECTS.map((p) =>
          <article className="work" data-card key={p.img}>
              <DeviceFrame project={p} className="work-frame" data-cursor="Ver site" />
              <div className="work-meta">
                <div>
                  <h3>{p.first} <em>{p.last}</em></h3>
                  <p className="work-tags">{p.tags}</p>
                </div>
                <p className="work-desc">{p.desc}</p>
              </div>
            </article>
          )}

          <article className="work work-next" data-card>
            <a className="work-frame" href={PROPOSAL_LINK} target="_blank" rel="noopener" data-cursor="Vamos conversar">
              <span className="work-next-hex" aria-hidden="true" />
              <span className="work-next-text">O próximo pode ser <em>o seu.</em></span>
              <span className="btn btn-solid">Solicitar proposta</span>
            </a>
            {/* An empty meta row keeps the frame aligned with the project cards */}
            <div className="work-meta" aria-hidden="true" />
          </article>
        </div>
        <div className="works-progress" aria-hidden="true"><span ref={barRef} /></div>
      </div>
    </section>);

}

// ─── PROBLEM — each line lights up as it crosses the screen ─
const PROBLEMS = [
"Você aparece no Google, mas ninguém clica",
"As pessoas entram no site e saem em segundos",
"Visitantes não viram conversa no WhatsApp",
"Você compete por preço porque o site não comunica autoridade",
"Cada lead que escapa é cliente do concorrente"];


export function Problem() {
  const listRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const items = [...listRef.current.children];
    return onFrame(() => {
      const center = window.innerHeight * 0.55;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const distance = Math.abs(rect.top + rect.height / 2 - center) / window.innerHeight;
        item.style.setProperty("--lit", 1 - clamp((distance - 0.08) * 3.4));
      });
    });
  }, []);

  return (
    <section className="sec problem" id="problema">
      <div className="wrap problem-grid">
        <div className="problem-head">
          <Title text="Seu site até existe, mas não traz *cliente nenhum?*" />
          <p className="lead">
            A maioria dos profissionais autônomos investe num site bonito e descobre, meses depois, que ele não passa de um cartão de visitas digital esquecido no Google. Sem estratégia de conversão, sem SEO, sem copy que vende — um site é só uma despesa.
          </p>
        </div>
        <ul className="problem-list" ref={listRef}>
          {PROBLEMS.map((text) =>
          <li key={text}><Icon name="x" /><span>{text}</span></li>
          )}
        </ul>
      </div>
    </section>);

}

// ─── SERVICES — strips that expand, as in the reference ─────
const SERVICES = [
{ t: "Copy estratégica", img: "copy", focus: "40% 50%", d: "Escrita do zero com base no seu posicionamento, público e oferta — não é template traduzido." },
{ t: "Design profissional", img: "design", focus: "52% 50%", d: "Alinhado à identidade visual do seu negócio, não a uma estética genérica de Wix." },
{ t: "SEO incluso", img: "seo", focus: "58% 40%", d: "Pra você aparecer no Google sem depender de tráfego pago. Sem custo extra, sem upsell." },
{ t: "Integrações que funcionam", img: "integracoes", focus: "55% 50%", d: "WhatsApp, formulários, automações e ferramentas que você já usa — conectadas no projeto." },
{ t: "Responsivo de verdade", img: "responsivo", focus: "62% 50%", d: "Mobile-first. Funciona perfeitamente em qualquer dispositivo, do iPhone SE ao desktop 4K." },
{ t: "Performance otimizada", img: "performance", focus: "72% 50%", d: "Carregamento rápido pra ranquear melhor no Google e segurar o visitante na página." }];


export function Services() {
  const [active, setActive] = useState(0);
  return (
    <section className="sec services" id="servicos">
      <div className="wrap services-head">
        <Title text="Site completo, do zero ao *primeiro lead.*" />
        <p className="lead">
          Eu não entrego "site bonito". Entrego estrutura de conversão. Cada elemento da página é pensado pra fazer o visitante tomar uma ação — agendar, comprar ou chamar no WhatsApp.
        </p>
      </div>
      <div className="strips">
        {SERVICES.map((s, i) =>
        <button
          type="button"
          key={s.t}
          className={`strip${active === i ? " on" : ""}`}
          aria-expanded={active === i}
          onClick={() => setActive(i)}
          onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
          onFocus={() => setActive(i)}>
            <picture>
              <source media="(max-width: 800px)" srcSet={`assets/strips/${s.img}-m.webp`} type="image/webp" />
              <img src={`assets/strips/${s.img}.webp`} alt="" loading="lazy" decoding="async" style={{ objectPosition: s.focus }} />
            </picture>
            <span className="strip-label">{s.t}</span>
            <span className="strip-body">
              <strong>{s.t}</strong>
              <span>{s.d}</span>
            </span>
          </button>
        )}
      </div>
    </section>);

}

// ─── DIFFERENTIALS — a hexagon of light rises behind the cards ─
export function Differentials() {
  const sectionRef = useRef(null);
  const riseRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    return onFrame(() => {
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = clamp((vh - rect.top) / (vh + rect.height * 0.5));
      riseRef.current.style.transform = `translate3d(-50%, ${(1 - p) * 34}vh, 0) scale(${1 + (1 - p) * 0.1})`;
      riseRef.current.style.opacity = clamp(p * 1.7);
    });
  }, []);

  return (
    <section className="sec diffs" ref={sectionRef}>
      <div className="diffs-sky" aria-hidden="true">
        <div className="diffs-rise" ref={riseRef}>
          <svg viewBox="0 0 1000 1000">
            <defs>
              <linearGradient id="rise-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4d9bff" stopOpacity=".62" />
                <stop offset=".2" stopColor="#3f6fe6" stopOpacity=".34" />
                <stop offset=".46" stopColor="#4a3fd6" stopOpacity=".14" />
                <stop offset=".7" stopColor="#070b15" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon className="rise-bloom" points="500,0 933,250 933,750 500,1000 67,750 67,250" />
            <polygon className="rise-glow" points="500,0 933,250 933,750 500,1000 67,750 67,250" />
            <polygon className="rise-body" points="500,0 933,250 933,750 500,1000 67,750 67,250" fill="url(#rise-fill)" />
          </svg>
        </div>
      </div>
      <div className="wrap diffs-inner">
        <Title className="center" text="Por que trabalhar *comigo*" />
        <div className="diffs-grid">
          {DIFFS.map((d) =>
          <article className="diff" key={d.t}>
              <h3><Words text={d.t} /></h3>
              <p>{d.d}</p>
            </article>
          )}
        </div>
      </div>
    </section>);

}

// ─── ABOUT ──────────────────────────────────────────────────
export function About() {
  return (
    <section className="sec about" id="sobre">
      <div className="wrap about-grid">
        <div className="about-text">
          <Title text="Sou Giovanne, web designer focado em *resultado mensurável.*" />
          <p className="lead">
            Não vendo "presença digital" — vendo páginas que convertem visitante em cliente pagante.
          </p>
          <div className="stats">
            {STATS.map((s) =>
            <div className="stat" key={s.label}>
                <strong><CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} /></strong>
                <span>{s.label}</span>
              </div>
            )}
          </div>
        </div>
        <figure className="about-photo">
          <img src="assets/about-portrait.webp" alt="Giovanne Marrone, de braços cruzados, em um estúdio escuro" loading="lazy" decoding="async" />
        </figure>
      </div>

      <div className="wrap clients">
        <h3>Alguns dos clientes que atendi</h3>
        <ul className="clients-grid">
          {CLIENTS.map((c) =>
          <li key={c.name}>
              <img src={c.img} alt="" loading="lazy" width="48" height="48" />
              <span>{c.name}</span>
            </li>
          )}
          <li className="clients-you">
            <a href={PROPOSAL_LINK} target="_blank" rel="noopener">+ Seu negócio aqui</a>
          </li>
        </ul>
      </div>
    </section>);

}

// ─── PLANS ──────────────────────────────────────────────────
export function Plans() {
  const onPointerMove = (event) => {
    const card = event.target.closest(".plan");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <section className="sec plans" id="planos">
      <div className="wrap">
        <div className="plans-head">
          <Title text="Planos para cada *momento* do seu negócio." />
          <p className="lead">
            Três escopos. Cada um pensado pra um momento diferente do seu negócio. Me conta o que você precisa e eu te passo o valor.
          </p>
        </div>

        <div className="plans-grid" onPointerMove={onPointerMove}>
          {PLANS.map((plan) =>
          <article className={`plan${plan.featured ? " featured" : ""}`} key={plan.name}>
              <header className="plan-top">
                <h3>{plan.name}</h3>
                <span className="plan-badge">{plan.badge}</span>
              </header>
              <p className="plan-desc">{plan.desc}</p>

              <div className="plan-summary">
                <Icon name="check" />
                <div>
                  <strong>{plan.summary[0]}</strong>
                  <span>{plan.summary[1]}</span>
                  <span>{plan.summary[2]}</span>
                </div>
              </div>

              <div className="plan-price">
                <span className="plan-blur" aria-hidden="true">R$ 0.000</span>
                <p>
                  <span className="plan-lock"><Icon name="lock" /></span>
                  <strong>Valor sob consulta</strong>
                </p>
              </div>

              <a
                className={`btn ${plan.featured ? "btn-solid" : "btn-line"} plan-cta`}
                href={whatsapp(`Oi Giovanne, quero solicitar uma proposta de ${plan.name}.`)}
                target="_blank"
                rel="noopener">
                {plan.cta}
              </a>
              <p className="plan-note">{plan.note}</p>

              <div className="plan-includes">
                <h4>O que está incluso</h4>
                <ul>
                  {plan.includes.map((item) =>
                  <li key={item}><Icon name="check" />{item}</li>
                  )}
                </ul>
              </div>
            </article>
          )}
        </div>

        <p className="plans-foot">{PAYMENT_TERMS}</p>
      </div>
    </section>);

}

// ─── FAQ ────────────────────────────────────────────────────
export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec faq" id="faq">
      <div className="wrap faq-grid">
        <div>
          <Title text="Perguntas *frequentes*" />
          <p className="lead">
            Dúvidas que aparecem antes da gente começar. Se a sua não está aqui, manda no WhatsApp.
          </p>
          <a href={whatsapp("Oi Giovanne, tenho uma dúvida sobre o meu site.")} target="_blank" rel="noopener" className="btn btn-line">
            Tirar dúvida no WhatsApp
          </a>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) =>
          <div className={`faq-item${open === i ? " open" : ""}`} key={item.q}>
              <h3>
                <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={open === i}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(open === i ? -1 : i)}>
                  {item.q}
                  <Icon name="plus" />
                </button>
              </h3>
              <div className="faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                <div><p>{item.a}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

// ─── FINALE — iris-out: the lens closes around the invitation ─
export function Finale() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (prefersReducedMotion()) {
      setStill(true);
      stage.style.setProperty("--p", 1);
      return;
    }
    return onFrame(() => {
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = stage.offsetHeight;
      const vw = stage.offsetWidth;
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      const p = clamp(-rect.top / (rect.height - vh) + 0.06);
      const e = 1 - Math.pow(1 - clamp(p / 0.86), 3);
      const open = Math.hypot(vw, vh) / 2 + 80;
      const closed = Math.max(Math.min(vh * 0.43, vw * 0.4), 330);
      stage.style.setProperty("--r", `${open + (closed - open) * e}px`);
      stage.style.setProperty("--a", `${e * 60 - 30}deg`);
      stage.style.setProperty("--p", e);
    });
  }, []);

  return (
    <section className={`finale${still ? " still" : ""}`} id="contato" data-scroll-end ref={sectionRef}>
      <div className="finale-stage" ref={stageRef}>
        <div className="finale-light" aria-hidden="true" />
        <div className="finale-copy">
          <img src="assets/logo.webp" alt="" width="52" height="52" loading="lazy" />
          <h2>Pronto pra ter um site que <em>vende por você?</em></h2>
          <p>
            Me conta sobre o seu negócio e o que você precisa. Te respondo com escopo, prazo e valor, direto no WhatsApp.
          </p>
          <a href={PROPOSAL_LINK} target="_blank" rel="noopener" className="btn btn-solid">
            <Icon name="whatsapp" />
            Falar com Giovanne no WhatsApp
          </a>
          <small>Resposta em até 2 horas em horário comercial.</small>
        </div>
        <Blades />
      </div>
    </section>);

}

// ─── FOOTER ─────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div className="brand">
          <img src="assets/logo.webp" alt="" width="34" height="34" loading="lazy" />
          <span>Giovanne Marrone</span>
        </div>
        <nav aria-label="Rodapé">
          {LINKS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a href="mailto:admin@gmarrone.com.br">admin@gmarrone.com.br</a>
      </div>
      <div className="wrap footer-end">
        <span>© {new Date().getFullYear()} Giovanne Marrone</span>
        <span>Feito pra converter</span>
      </div>
    </footer>);

}
