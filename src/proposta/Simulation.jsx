import React from "react";
import { clamp, onFrame } from "../lib/scroll.js";

const { useEffect, useLayoutEffect, useRef } = React;

// A working model of the site being proposed, on a laptop and a phone. The screens are real
// markup, so the client's name, address and layouts are live. Each shot matches the item at the
// same position in the plan's `includes`: which screen to show, what to frame on it, where the
// camera stands. Nothing here states a result: no scores, rankings, prices or testimonials.
const SHOTS = {
  "Landing Page": [
    { view: "site", part: "headline", cam: "a", write: true },
    { view: "site", part: "hero", cam: "b", float: "design" },
    { view: "site", cam: "c", float: "search" },
    { view: "site", part: "whats", cam: "phone", phone: "chat" },
    { view: "site", cam: "both", pan: true },
    { view: "site", cam: "front", load: true, float: "speed" },
  ],
  "Site Institucional": [
    { view: "site", part: "nav", cam: "a", float: "map" },
    { view: "site", part: "blog", cam: "b" },
    { view: "site", part: "headline", cam: "c", float: "search", write: true },
    { view: "admin", part: "editor", cam: "front" },
    { view: "site", part: "contact", cam: "phone", phone: "chat" },
    { view: "admin", cam: "b", float: "video" },
  ],
  "E-commerce": [
    { view: "site", part: "grid", cam: "a" },
    { view: "checkout", part: "pay", cam: "b" },
    { view: "site", part: "drawer", cam: "phone", phone: "push", drawer: true },
    { view: "site", part: "crumbs", cam: "c", float: "search" },
    { view: "admin", part: "table", cam: "front" },
    { view: "admin", cam: "b", float: "video" },
  ],
};

const ART = "../assets/sim-serra.webp";
const CLOCK = "9:41";

const domainOf = (client) => {
  const slug = client.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug.slice(0, 26) || "seusite"}.com.br`;
};

// Offsets ignore the 3D rig, so these are the screen's own pixels.
function place(el, root) {
  let x = 0;
  let y = 0;
  for (let node = el; node && node !== root; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const PATHS = {
  lock: "M7.5 11V8a4.5 4.5 0 0 1 9 0v3M6.5 11h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.4-4.4",
  bag: "M6 8h12l1 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 8zM9 10V6a3 3 0 0 1 6 0v4",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chat: "M3.5 20.5l1.4-4.6a8.5 8.5 0 1 1 3.3 3.2l-4.7 1.4z",
  left: "M15 6l-6 6 6 6",
  right: "M9 6l6 6-6 6",
  reload: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  pages: "M7 3h8l4 4v14H7zM15 3v4h4",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4",
  box: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z",
  send: "M4 12l16-8-6 16-3-7-7-1z",
};
const Icon = ({ name, ...props }) =>
  <svg className="ico" viewBox="0 0 24 24" {...props}><path d={PATHS[name]} /></svg>;

const Logo = ({ client }) =>
  <span className="ms-logo"><i>{client.trim()[0]}</i><b>{client}</b></span>;

const Words = ({ text, from = 0 }) => text.split(" ").map((word, i) =>
  <span key={word + i} style={{ "--i": from + i }}>{word} </span>);

// ─── Sites ──────────────────────────────────────────────────
function Hero({ title, sub, cta, ghost }) {
  return (
    <section className="ms-hero" data-part="hero">
      <img src={ART} alt="" />
      <div className="ms-hero-copy">
        <span className="ms-h1" data-part="headline">
          <Words text={title[0]} /><em><Words text={title[1]} from={title[0].split(" ").length} /></em>
        </span>
        <p>{sub}</p>
        <span className="ms-actions">
          <span className="ms-btn">{cta}</span>
          {ghost && <span className="ms-btn ghost">{ghost}</span>}
        </span>
      </div>
    </section>);

}

function Cards({ items }) {
  return (
    <div className="ms-cards">
      {items.map(([title, text]) =>
        <div className="ms-card" key={title}>
          <b>{title}</b>
          <p>{text}</p>
        </div>)}
    </div>);

}

function Foot({ client }) {
  return (
    <footer className="ms-foot">
      <Logo client={client} />
      <span>Todos os direitos reservados</span>
    </footer>);

}

function LandingSite({ client }) {
  return (
    <>
      <header className="ms-nav over">
        <Logo client={client} />
        <nav><span>Como funciona</span><span>Para quem é</span><span>Dúvidas</span></nav>
        <span className="ms-btn small">Falar no WhatsApp</span>
      </header>
      <Hero title={["Seu próximo cliente", "começa aqui."]} cta="Quero saber mais"
        sub="Uma página escrita do zero para o seu público, com um único objetivo: transformar visita em conversa." />
      <section className="ms-sec">
        <span className="ms-h2">Por que <em>escolher</em> a gente</span>
        <Cards items={[
          ["Atendimento próximo", "Quem chega aqui fala direto com quem resolve."],
          ["Processo claro", "Cada etapa explicada antes de começar."],
          ["Sem enrolação", "Você sabe o que recebe e quando recebe."]]} />
      </section>
      <section className="ms-split">
        <img src={ART} alt="" />
        <div>
          <span className="ms-h2">Feito para o <em>seu momento</em></span>
          <ul>
            <li><Icon name="check" />Entenda como funciona em poucos minutos</li>
            <li><Icon name="check" />Tire suas dúvidas antes de decidir</li>
            <li><Icon name="check" />Comece com um clique</li>
          </ul>
        </div>
      </section>
      <section className="ms-band">
        <span className="ms-h2">Vamos <em>conversar?</em></span>
        <span className="ms-btn">Falar no WhatsApp</span>
      </section>
      <Foot client={client} />
    </>);

}

const POSTS = [
  ["Guia", "Como escolher o profissional certo", "30% 74%"],
  ["Dicas", "Cinco perguntas antes de contratar", "70% 60%"],
  ["Novidades", "O que muda no primeiro mês", "50% 86%"],
];

function InstitutionalSite({ client }) {
  return (
    <>
      <header className="ms-nav over" data-part="nav">
        <Logo client={client} />
        <nav><span className="on">Início</span><span>Sobre</span><span>Serviços</span><span>Blog</span><span>Contato</span></nav>
        <span className="ms-btn small">Agendar conversa</span>
      </header>
      <Hero title={["A autoridade que você tem,", "visível na internet."]} cta="Conheça os serviços" ghost="Fale com a gente"
        sub="Presença digital completa, pensada para gerar confiança antes mesmo do primeiro contato." />
      <section className="ms-sec">
        <span className="ms-h2">Nossos <em>serviços</em></span>
        <Cards items={[
          ["Serviço principal", "O que você faz de melhor, explicado sem jargão."],
          ["Segundo serviço", "Para quem precisa de um caminho diferente."],
          ["Terceiro serviço", "Uma solução completa, do início ao fim."]]} />
      </section>
      <section className="ms-sec tint" data-part="blog">
        <span className="ms-h2">Do nosso <em>blog</em></span>
        <div className="ms-posts">
          {POSTS.map(([tag, title, at]) =>
            <article key={title}>
              <img src={ART} alt="" style={{ objectPosition: at }} />
              <small>{tag}</small>
              <b>{title}</b>
            </article>)}
        </div>
      </section>
      <section className="ms-contact" data-part="contact">
        <div>
          <span className="ms-h2">Vamos <em>conversar?</em></span>
          <p>Conte o que você precisa e a resposta chega direto no seu WhatsApp.</p>
        </div>
        <div className="ms-form">
          <span>Nome</span>
          <span>E-mail</span>
          <span className="long">Como podemos ajudar?</span>
          <span className="ms-btn">Enviar mensagem</span>
        </div>
      </section>
      <Foot client={client} />
    </>);

}

// Neutral goods: the store is not a real catalogue, so nothing here is a specific product.
const GOODS = [
  { tint: "#e9e3d8", body: "#2a3142", cap: "#c7a878", shape: "bottle" },
  { tint: "#dfe6ea", body: "#f4f1ea", cap: "#1b2230", shape: "jar" },
  { tint: "#e6dfe2", body: "#7d4a52", cap: "#e8d9c8", shape: "tube" },
  { tint: "#e2e6dc", body: "#46583f", cap: "#d9d3c2", shape: "box" },
  { tint: "#ece4d6", body: "#c98a4b", cap: "#2a2118", shape: "dropper" },
  { tint: "#dde2ec", body: "#26304a", cap: "#9fb3d6", shape: "jar" },
];

function Good({ tint, body, cap, shape }) {
  return (
    <svg viewBox="0 0 200 200" style={{ background: tint }}>
      <ellipse cx="100" cy="171" rx="52" ry="7" fill="#000" opacity=".14" />
      {shape === "bottle" && <><rect x="70" y="66" width="60" height="104" rx="9" fill={body} /><rect x="86" y="38" width="28" height="30" rx="4" fill={cap} /></>}
      {shape === "jar" && <><rect x="58" y="96" width="84" height="74" rx="12" fill={body} /><rect x="54" y="76" width="92" height="24" rx="6" fill={cap} /></>}
      {shape === "tube" && <><path d="M72 40h56l-8 112a6 6 0 0 1-6 6H86a6 6 0 0 1-6-6z" fill={body} /><rect x="84" y="152" width="32" height="18" rx="4" fill={cap} /></>}
      {shape === "box" && <><rect x="62" y="58" width="76" height="112" rx="3" fill={body} /><rect x="62" y="96" width="76" height="30" fill={cap} /></>}
      {shape === "dropper" && <><rect x="72" y="84" width="56" height="86" rx="10" fill={body} /><rect x="88" y="60" width="24" height="26" rx="3" fill={cap} /><rect x="93" y="34" width="14" height="28" rx="6" fill={cap} /></>}
      <rect x="76" y="86" width="9" height="70" rx="4" fill="#fff" opacity=".2" />
    </svg>);

}

function StoreSite({ client, tall }) {
  return (
    <>
      <p className="ms-promo">Compre online com pagamento seguro</p>
      <header className="ms-nav">
        <Logo client={client} />
        <nav><span className="on">Coleção</span><span>Novidades</span><span>Sobre</span></nav>
        <span className="ms-tools"><Icon name="search" /><span className="ms-bag"><Icon name="bag" /><i>2</i></span></span>
      </header>
      <p className="ms-crumbs" data-part="crumbs">Início <Icon name="right" /> Coleção <Icon name="right" /> <b>Todos os produtos</b></p>
      <section className="ms-shop">
        <span className="ms-h2">Toda a <em>coleção</em></span>
        <div className="ms-grid" data-part="grid">
          {GOODS.slice(0, tall ? 4 : 6).map((good, i) =>
            <article key={i}>
              <Good {...good} />
              <b>{`Produto 0${i + 1}`}</b>
              <small>R$ 000,00</small>
            </article>)}
        </div>
      </section>
      <Foot client={client} />
    </>);

}

const SITES = { "Landing Page": LandingSite, "Site Institucional": InstitutionalSite, "E-commerce": StoreSite };

function Drawer() {
  return (
    <aside className="ms-drawer" data-part="drawer">
      <b>Seu carrinho</b>
      {GOODS.slice(0, 2).map((good, i) =>
        <div className="ms-line" key={i}>
          <Good {...good} />
          <span>{`Produto 0${i + 1}`}<small>Quantidade: 1</small></span>
          <small>R$ 000,00</small>
        </div>)}
      <span className="ms-btn">Finalizar compra</span>
    </aside>);

}

// ─── Behind the site ────────────────────────────────────────
function Admin({ client, store }) {
  const menu = store ?
    [["pages", "Painel"], ["box", "Produtos"], ["bag", "Pedidos"], ["gear", "Ajustes"]] :
    [["pages", "Painel"], ["pages", "Páginas"], ["image", "Mídia"], ["gear", "Ajustes"]];

  return (
    <div className="ad">
      <aside>
        <Logo client={client} />
        {menu.map(([icon, label], i) =>
          <span className={i === 1 ? "on" : ""} key={label}><Icon name={icon} />{label}</span>)}
      </aside>
      {store ?
        <main className="ad-main">
          <div className="ad-head"><b>Produtos</b><span className="ms-btn small">Adicionar novo</span></div>
          <div className="ad-table" data-part="table">
            <p className="ad-row head"><span>Produto</span><span>Estoque</span><span>Preço</span><span>Status</span></p>
            {GOODS.slice(0, 5).map((good, i) =>
              <p className="ad-row" key={i}>
                <span><Good {...good} />{`Produto 0${i + 1}`}</span>
                <span>Em estoque</span>
                <span>R$ 000,00</span>
                <span><u>Publicado</u></span>
              </p>)}
          </div>
        </main> :
        <main className="ad-main">
          <div className="ad-head"><b>Editar página</b><span className="ms-btn small">Atualizar</span></div>
          <div className="ad-editor" data-part="editor">
            <small>Título</small>
            <span className="ad-title">Início</span>
            <small>Texto principal</small>
            <span className="ad-field">A autoridade que você tem, visível na internet.<i /></span>
            <small>Imagem de destaque</small>
            <img src={ART} alt="" />
          </div>
        </main>}
    </div>);

}

function Checkout({ client }) {
  return (
    <div className="co">
      <div className="co-form">
        <Logo client={client} />
        <small>Contato</small>
        <span className="co-field">E-mail</span>
        <small>Pagamento</small>
        <div className="co-pay" data-part="pay">
          <p className="co-tabs"><span className="on">Cartão</span><span>Pix</span><span>Boleto</span></p>
          <span className="co-field">Número do cartão</span>
          <p className="co-pair"><span className="co-field">Validade</span><span className="co-field">CVV</span></p>
          <span className="ms-btn co-go"><span>Pagar agora</span><span><Icon name="check" />Pagamento aprovado</span></span>
        </div>
      </div>
      <aside className="co-sum">
        <b>Resumo do pedido</b>
        {GOODS.slice(0, 2).map((good, i) =>
          <div className="ms-line" key={i}>
            <Good {...good} />
            <span>{`Produto 0${i + 1}`}</span>
            <small>R$ 000,00</small>
          </div>)}
        <p className="co-total"><span>Total</span><b>R$ 000,00</b></p>
      </aside>
    </div>);

}

// ─── Laid over the laptop ───────────────────────────────────
function Search({ client, domain, plan, store }) {
  return (
    <>
      <p className="sf-q"><Icon name="search" />{client}</p>
      <p className="sf-host"><i>{client.trim()[0]}</i><span>{client}<small>https://{domain}{store ? " › colecao" : ""}</small></span></p>
      <b className="sf-title">{store ? `Toda a coleção | ${client}` : `${client} | Site oficial`}</b>
      <p className="sf-desc">{plan.desc}</p>
    </>);

}

function Design() {
  return (
    <>
      <p className="sf-type"><em>Aa</em><span>Tipografia<small>Título e texto</small></span></p>
      <p className="sf-colors"><i /><i /><i /><i /></p>
    </>);

}

function SiteMap() {
  return (
    <>
      <span className="sf-root">Início</span>
      <span className="sf-tree"><i /></span>
      <p className="sf-leaves"><span>Sobre</span><span>Serviços</span><span>Blog</span><span>Contato</span></p>
    </>);

}

function Speed() {
  return (
    <>
      <svg className="sf-gauge" viewBox="0 0 120 70">
        <path d="M12 62a48 48 0 0 1 96 0" pathLength="1" />
        <path className="fill" d="M12 62a48 48 0 0 1 96 0" pathLength="1" />
      </svg>
      <p className="sf-ticks">
        <span><Icon name="check" />Imagens otimizadas</span>
        <span><Icon name="check" />Código enxuto</span>
      </p>
    </>);

}

function Video() {
  return (
    <>
      <img src={ART} alt="" />
      <span className="sf-play"><svg viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19" /></svg></span>
      <p className="sf-lesson"><b>Como editar sozinho</b><small>Treinamento</small></p>
      <span className="sf-scrub"><i /></span>
    </>);

}

const FLOATS = { search: Search, design: Design, map: SiteMap, speed: Speed, video: Video };

// ─── Laptop ─────────────────────────────────────────────────
const key = (x, y, w, h, r = 5) =>
  `M${x + r} ${y}h${w - r * 2}a${r} ${r} 0 0 1 ${r} ${r}v${h - r * 2}a${r} ${r} 0 0 1 ${-r} ${r}h${r * 2 - w}a${r} ${r} 0 0 1 ${-r} ${-r}v${r * 2 - h}a${r} ${r} 0 0 1 ${r} ${-r}z`;

// Every row is scaled to the same width, the way a real keyboard lines up.
const KEYS = (() => {
  const rows = [
    [24, Array(14).fill(1)],
    [40, [...Array(13).fill(1), 1.5]],
    [40, [1.5, ...Array(13).fill(1)]],
    [40, [1.8, ...Array(11).fill(1), 1.8]],
    [40, [2.35, ...Array(10).fill(1), 2.35]],
    [40, [1, 1, 1, 1.3, 5.4, 1.3, 1, 1, 1, 1]],
  ];
  const gap = 5;
  const width = 620;
  let y = 0;
  let d = "";
  rows.forEach(([height, units]) => {
    const unit = (width - gap * (units.length - 1)) / units.reduce((sum, u) => sum + u, 0);
    let x = 0;
    units.forEach((u) => {
      d += key(+x.toFixed(1), y, +(u * unit).toFixed(1), height);
      x += u * unit + gap;
    });
    y += height + gap;
  });
  return d;
})();

function MacBook({ client, domain, plan, shot, Site, viewRef, focusRef, floatRef }) {
  const store = plan.name === "E-commerce";
  const Float = FLOATS[shot.float];

  return (
    <div className="mac">
      <div className="mac-base">
        <span className="mac-floor" />
        <span className="mac-deck">
          <span className="mac-hinge" />
          <span className="mac-grill l" />
          <svg className="mac-keys" viewBox="0 0 620 250"><path d={KEYS} /></svg>
          <span className="mac-grill r" />
          <span className="mac-pad" />
        </span>
        <span className="mac-lip"><i /></span>
        <span className="mac-edge l" />
        <span className="mac-edge r" />
      </div>

      <div className="mac-lid">
        <div className="mac-back"><img src="../assets/logo.webp" alt="" /></div>
        <div className="mac-face">
          <div className="mac-screen">
            <div className={`mac-ui${shot.load ? " loading" : ""}`}>
              <div className="mac-menu">
                <b>Safari</b><span>Arquivo</span><span>Editar</span><span>Visualizar</span>
                <span className="mac-time">{CLOCK}</span>
              </div>
              <div className="br-bar">
                <span className="br-dots"><i /><i /><i /></span>
                <Icon name="left" /><Icon name="right" />
                <span className="br-url"><Icon name="lock" />{domain}<Icon name="reload" /></span>
                <span className="br-load" />
              </div>
              <div className={`br-view${shot.drawer ? " drawer" : ""}${shot.write ? " writing" : ""}${shot.float === "design" ? " gridded" : ""}`} ref={viewRef}>
                <div className={`br-page ms${shot.view === "site" ? " on" : ""}${shot.pan ? " panning" : ""}`} data-view="site"><Site client={client} /></div>
                {plan.name !== "Landing Page" &&
                  <div className={`br-page${shot.view === "admin" ? " on" : ""}`} data-view="admin"><Admin client={client} store={store} /></div>}
                {store &&
                  <div className={`br-page${shot.view === "checkout" ? " on" : ""}`} data-view="checkout"><Checkout client={client} /></div>}

                <span className="br-columns"><i /><i /><i /><i /><i /><i /></span>
                {store ? <Drawer /> : <span className="ms-whats" data-part="whats"><Icon name="chat" /></span>}
                <span className="br-skeleton"><i /><i /><i /><i /></span>
                <span className={`sim-focus${shot.part ? " on" : ""}`} ref={focusRef} />
              </div>
            </div>
            <span className="mac-notch" />
            <span className="mac-glare" />
          </div>
        </div>
        <div className={`sf sf-${shot.float ?? "none"}${Float ? " on" : ""}`} key={shot.float} ref={floatRef}>
          {Float && <Float client={client} domain={domain} plan={plan} store={store} />}
        </div>
      </div>
    </div>);

}

// ─── Phone ──────────────────────────────────────────────────
function Chat({ client }) {
  return (
    <div className="wa">
      <header><i>{client.trim()[0]}</i><span>{client}<small>online</small></span><Icon name="phone" /></header>
      <div className="wa-log">
        <p className="in">Oi! Vim pelo site e quero saber mais.<small>{CLOCK}</small></p>
        <p className="out">Oi! Que bom te ver por aqui. Como posso ajudar?<small>{CLOCK}</small></p>
      </div>
      <footer><span>Mensagem</span><i><Icon name="send" /></i></footer>
    </div>);

}

function Push({ client }) {
  return (
    <div className="lock">
      <img src={ART} alt="" />
      <p className="lock-time">{CLOCK}</p>
      <div className="lock-note">
        <i>{client.trim()[0]}</i>
        <span>{client}<small>Seu carrinho ainda está aqui. Finalize quando quiser.</small></span>
      </div>
    </div>);

}

function IPhone({ client, domain, shot, Site, phoneRef }) {
  const view = shot.phone ?? "site";

  return (
    <div className={`iph${view !== "site" ? " alert" : ""}`}>
      <span className="iph-btn a" /><span className="iph-btn b" /><span className="iph-btn c" /><span className="iph-btn d" />
      <div className="iph-screen">
        <div className="iph-ui">
          <p className={`iph-status${view === "push" ? " light" : ""}`}>
            <b>{CLOCK}</b>
            <span><i /><i /><i /><i /><em /></span>
          </p>
          <div className="iph-view" ref={phoneRef}>
            <div className={`iph-page ms tall${view === "site" ? " on" : ""}${shot.pan ? " panning" : ""}`}><Site client={client} tall /></div>
            <div className={`iph-page${view === "chat" ? " on" : ""}`}><Chat client={client} /></div>
            <div className={`iph-page${view === "push" ? " on" : ""}`}><Push client={client} /></div>
          </div>
          {view === "site" && <p className="iph-url"><Icon name="lock" />{domain}</p>}
          <span className="iph-home" />
        </div>
        <span className="iph-island" />
      </div>
    </div>);

}

// ─── The scene ──────────────────────────────────────────────
export function Simulation({ plan, client, active, listRef }) {
  const shot = SHOTS[plan.name][active];
  const domain = domainOf(client);
  const Site = SITES[plan.name];

  const rootRef = useRef(null);
  const viewRef = useRef(null);
  const focusRef = useRef(null);
  const floatRef = useRef(null);
  const phoneRef = useRef(null);
  const leaderRef = useRef(null);
  const nodeRef = useRef(null);

  // Drawn at one size and scaled as a whole, so the rig stays in proportion on any screen.
  useEffect(() => {
    const box = rootRef.current.parentElement;
    const fit = () => rootRef.current.style.setProperty("--fit",
      Math.min(box.clientWidth / 1060, box.clientHeight / 770).toFixed(4));
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Scrolls the site to the part in question and frames it.
  useLayoutEffect(() => {
    const view = viewRef.current;
    const page = view.querySelector(`[data-view="${shot.view}"]`);
    const target = shot.part && view.querySelector(`[data-part="${shot.part}"]`);
    const room = Math.max(page.offsetHeight - view.clientHeight, 0);
    let y = 0;

    if (target) {
      const box = place(target, view);
      const inPage = page.contains(target);
      if (inPage) y = clamp(box.y + box.h / 2 - view.clientHeight / 2, 0, room);
      const pad = 14;
      const focus = focusRef.current.style;
      focus.left = `${box.x - pad}px`;
      focus.top = `${box.y - (inPage ? y : 0) - pad}px`;
      focus.width = `${box.w + pad * 2}px`;
      focus.height = `${box.h + pad * 2}px`;
    }
    page.style.setProperty("--scroll", `${-y}px`);
    page.style.setProperty("--travel", `${-room}px`);

    const screen = phoneRef.current;
    const phonePage = screen.querySelector(".iph-page.ms");
    phonePage.style.setProperty("--travel", `${-Math.max(phonePage.offsetHeight - screen.clientHeight, 0)}px`);
  }, [shot, client]);

  // A hairline from the item being read to the part of the site it pays for.
  useEffect(() => {
    return onFrame(() => {
      const line = leaderRef.current;
      const node = nodeRef.current;
      const item = listRef.current?.querySelector("li.on h3");
      const hidden = () => {
        line.removeAttribute("d");
        node.style.opacity = 0;
      };
      const lit = parseFloat(rootRef.current.closest(".scope-grid").style.getPropertyValue("--p")) > 0.9;
      if (!item || !lit || window.innerWidth <= 900) return hidden();

      const { shot: now } = rootRef.current.dataset;
      const aim = now === "float" ? floatRef.current : now === "phone" ? phoneRef.current : focusRef.current;
      const from = item.getBoundingClientRect();
      const to = aim.getBoundingClientRect();
      if (from.bottom < 0 || from.top > window.innerHeight) return hidden();

      const sy = from.top + from.height / 2;
      const sx = item.parentElement.getBoundingClientRect().right + 8;
      const ex = to.left;
      const ey = clamp(sy, to.top + 12, to.bottom - 12);
      line.setAttribute("d", `M${sx.toFixed(1)} ${sy.toFixed(1)}H${(sx + 18).toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`);
      node.setAttribute("cx", ex.toFixed(1));
      node.setAttribute("cy", ey.toFixed(1));
      node.style.opacity = 1;
    });
  }, []);

  const pointing = shot.phone || shot.pan ? "phone" : shot.part ? "focus" : "float";

  return (
    <>
      <div className="sim" ref={rootRef} data-cam={shot.cam} data-shot={pointing} aria-hidden="true">
        <span className="sim-glow" />
        <div className="sim-lift">
          <div className="sim-rig">
            <MacBook client={client} domain={domain} plan={plan} shot={shot} Site={Site}
              viewRef={viewRef} focusRef={focusRef} floatRef={floatRef} />
            <IPhone client={client} domain={domain} shot={shot} Site={Site} phoneRef={phoneRef} />
          </div>
        </div>
      </div>
      <svg className="sim-leader" aria-hidden="true">
        <path ref={leaderRef} />
        <circle ref={nodeRef} r="3.5" />
      </svg>
    </>);

}
