import React from "react";
const { useState, useEffect, useRef } = React;

// ─── Helpers ────────────────────────────────────────────────
function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ as: Tag = "div", className = "", delay = 0, dir = "up", style = {}, children, ...rest }) {
  const [ref, inView] = useInView();
  const base = dir === "left" ? "reveal-left" : dir === "right" ? "reveal-right" : "reveal";
  return (
    <Tag
      ref={ref}
      className={`${base}${inView ? " in" : ""} ${className}`}
      style={{ "--rev-delay": `${delay}ms`, ...style }}
      {...rest}>
      
      {children}
    </Tag>);

}

function CountUp({ to, suffix = "", duration = 1600, prefix = "" }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// ─── NAV ────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#" className="brand">
          <img src="assets/logo.webp" alt="Giovanne Marrone" className="brand-logo" />
          <span className="brand-text">
            <span className="name">Giovanne Marrone</span>
            <span className="role">web designer</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#problema">Problema</a>
          <a href="#solucao">Solução</a>
          <a href="#projetos">Projetos</a>
          <a href="#provas">Portfólio</a>
          <a href="#faq">FAQ</a>
        </div>
        <a href="#cta" className="btn btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
          Diagnóstico grátis <span className="arrow">→</span>
        </a>
      </div>
    </nav>);

}

const CLIENTS = [
{ name: "Dra. Eduarda Costa", img: "assets/clients/eduarda.webp" },
{ name: "Nutri Juliane Marrone", img: "assets/clients/juliane.webp" },
{ name: "Grupo Líbertas", img: "assets/clients/libertas.webp" },
{ name: "IGT International Coaching", img: "assets/clients/igt.webp" },
{ name: "Bettina Rudolph", img: "assets/clients/bettina.webp" },
{ name: "Geronimo Theml", img: "assets/clients/geronimo.webp" }];


function TrustStack() {
  return (
    <div className="trust-stack">
      <div className="trust-avatars">
        {CLIENTS.map((c, i) =>
        <div className="trust-avatar" key={i} style={{ zIndex: CLIENTS.length - i }}>
            <img src={c.img} alt={c.name} loading="lazy" />
            <span className="tip">{c.name}</span>
          </div>
        )}
      </div>
      <div className="trust-count">
        <span className="star">★★★★★</span>
        <span><strong>+30 profissionais</strong> já confiaram</span>
      </div>
    </div>);

}

// Portrait background — used by all 3 hero variants
function HeroBg() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <picture>
        <source media="(max-width: 800px)" srcSet="assets/giovanne-portrait-mobile.webp" type="image/webp" />
        <source media="(min-width: 801px)" srcSet="assets/giovanne-portrait.webp" type="image/webp" />
        <img src="assets/giovanne-portrait.webp" alt="" fetchpriority="high" loading="eager" decoding="async" />
      </picture>
    </div>);

}

// ─── HERO V1 — Typography-first ─────────────────────────────
function HeroV1() {
  return (
    <section className="hero hero-v1" id="topo">
      <HeroBg />
      <div className="container">
        <div className="hero-content">
          <Reveal>
            <span className="eyebrow">
              <span className="pulse"></span>
              Web designer · Especialista em conversão
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-headline" style={{ fontSize: "60px" }}>
              Sites que vendem <span className="accent-word" style={{ fontWeight: "700", fontFamily: "Lora" }}>enquanto</span> você atende seus clientes
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="lead hero-sub">
              Desenvolvo sites, landing pages e e-commerces com copy estratégica, design profissional e SEO incluso — a mesma estrutura que aumentou em mais de 20% a taxa de conversão de grandes players do digital.
            </p>
          </Reveal>
          <Reveal delay={260} className="hero-actions">
            <a href="#cta" className="btn btn-primary btn-lg">Quero meu diagnóstico gratuito <span className="arrow">→</span></a>
            <a href="#projetos" className="btn btn-ghost btn-lg">Ver tipos de projeto</a>
          </Reveal>
          <Reveal delay={340}>
            <div className="hero-micro">Análise honesta do seu site atual. Sem enrolação, sem venda forçada.</div>
          </Reveal>
          <Reveal delay={400}>
            <TrustStack />
          </Reveal>
        </div>

        <Reveal delay={420}>
          <div className="hero-author-tag">
            <span>Giovanne Marrone</span>
            <span className="muted">/ web designer</span>
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="hero-metrics">
            <div className="hero-metric">
              <div className="n">+<CountUp to={40} /></div>
              <div className="l">páginas / Bettina Rudolph</div>
            </div>
            <div className="hero-metric">
              <div className="n">+<CountUp to={15} /></div>
              <div className="l">páginas / Gerônimo Theml</div>
            </div>
            <div className="hero-metric">
              <div className="n">+<CountUp to={20} suffix="%" /></div>
              <div className="l">connect rate</div>
            </div>
            <div className="hero-metric">
              <div className="n"><CountUp to={2} />a</div>
              <div className="l">de bastidor digital</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>);

}

// ─── HERO V2 — Split (text only) ────────────────────────────
function HeroV2() {
  return (
    <section className="hero hero-v2" id="topo">
      <HeroBg />
      <div className="container">
        <div className="hero-content">
          <Reveal>
            <span className="eyebrow">
              <span className="pulse"></span>
              Web designer · Especialista em conversão
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-headline">
              Sites que <span className="accent-word">vendem</span> enquanto você atende seus clientes
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="lead hero-sub">
              Sites, landing pages e e-commerces com copy estratégica, design profissional e SEO incluso — a mesma estrutura que aumentou em mais de 20% a conversão de grandes players do digital.
            </p>
          </Reveal>
          <Reveal delay={260} className="hero-actions">
            <a href="#cta" className="btn btn-primary btn-lg">Quero meu diagnóstico gratuito <span className="arrow">→</span></a>
            <a href="#projetos" className="btn btn-ghost btn-lg">Tipos de projeto</a>
          </Reveal>
          <Reveal delay={340}>
            <div className="hero-micro">Análise honesta do seu site atual. Sem enrolação.</div>
          </Reveal>
          <Reveal delay={400}>
            <TrustStack />
          </Reveal>
        </div>
      </div>
    </section>);

}

// ─── HERO V3 — Left text + floating cards over portrait ────
function HeroV3() {
  return (
    <section className="hero hero-v3" id="topo">
      <HeroBg />
      <div className="container">
        <div className="hero-stage">
          <div className="hero-content">
            <Reveal>
              <span className="eyebrow">
                <span className="pulse"></span>
                Web designer · Especialista em conversão
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="hero-headline">
                Sites que <span className="accent-word">vendem</span> enquanto você atende seus clientes
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="lead hero-sub">
                Copy estratégica, design profissional e SEO incluso — a estrutura que já aumentou em mais de 20% a conversão de grandes players do digital.
              </p>
            </Reveal>
            <Reveal delay={260} className="hero-actions">
              <a href="#cta" className="btn btn-primary btn-lg">Quero meu diagnóstico gratuito <span className="arrow">→</span></a>
              <a href="#projetos" className="btn btn-ghost btn-lg">Ver projetos</a>
            </Reveal>
            <Reveal delay={340}>
              <div className="hero-micro">Análise honesta do seu site atual. Sem enrolação, sem venda forçada.</div>
            </Reveal>
            <Reveal delay={400}>
              <TrustStack />
            </Reveal>
          </div>

          <div className="float-card fc-1">
            <div className="fc-label">Leads / mês</div>
            <div className="fc-value"><CountUp to={184} /></div>
            <div className="fc-delta">↑ 3.2× em 60 dias</div>
          </div>
          <div className="float-card fc-2">
            <div className="fc-label">SEO score</div>
            <div className="fc-value">98<span style={{ fontSize: 14, color: "var(--muted)" }}>/100</span></div>
            <div className="fc-delta">Core Web Vitals · OK</div>
          </div>
          <div className="float-card fc-3">
            <div className="fc-label">Connect rate</div>
            <div className="fc-value">+<CountUp to={20} suffix="%" /></div>
            <div className="fc-delta">grandes players</div>
          </div>
          <div className="float-card fc-4">
            <div className="fc-label">Tempo de carga</div>
            <div className="fc-value">1.1<span style={{ fontSize: 14, color: "var(--muted)" }}>s</span></div>
            <div className="fc-delta">↓ 68% vs. template</div>
          </div>
        </div>
      </div>
    </section>);

}

// ─── PROBLEM ────────────────────────────────────────────────
const PROBLEMS = [
"Você aparece no Google, mas ninguém clica",
"As pessoas entram no site e saem em segundos",
"Visitantes não viram conversa no WhatsApp",
"Você compete por preço porque o site não comunica autoridade",
"Cada lead que escapa é cliente do concorrente"];


function Problem() {
  return (
    <section className="problem" id="problema">
      <div className="container">
        <div className="grid">
          <div>
            <Reveal>
              <span className="section-label">01 / Problema</span>
            </Reveal>
            <Reveal delay={80}>
              <h2>Seu site existe, mas não traz cliente nenhum?</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="lead">
                A maioria dos profissionais autônomos investe num site bonito e descobre, meses depois, que ele não passa de um cartão de visitas digital esquecido no Google. Sem estratégia de conversão, sem SEO, sem copy que vende — um site é só uma despesa.
              </p>
            </Reveal>
          </div>
          <div>
            <ul>
              {PROBLEMS.map((p, i) =>
              <Reveal as="li" key={i} delay={i * 80} dir="right">
                  <span className="x">✕</span>
                  <span>{p}</span>
                </Reveal>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>);

}

// ─── SOLUTION ───────────────────────────────────────────────
const FEATURES = [
{ t: "Copy estratégica", d: "Escrita do zero com base no seu posicionamento, público e oferta — não é template traduzido." },
{ t: "Design profissional", d: "Alinhado à identidade visual do seu negócio, não a uma estética genérica de Wix." },
{ t: "SEO incluso", d: "Pra você aparecer no Google sem depender de tráfego pago. Sem custo extra, sem upsell." },
{ t: "Integrações que funcionam", d: "WhatsApp, formulários, automações e ferramentas que você já usa — conectadas no projeto." },
{ t: "Responsivo de verdade", d: "Mobile-first. Funciona perfeitamente em qualquer dispositivo, do iPhone SE ao desktop 4K." },
{ t: "Performance otimizada", d: "Carregamento rápido pra ranquear melhor no Google e segurar o visitante na página." }];


function Solution() {
  return (
    <section className="solution" id="solucao">
      <div className="container">
        <div className="grid">
          <div>
            <Reveal>
              <span className="section-label">02 / Solução</span>
            </Reveal>
            <Reveal delay={80}>
              <h2>Site completo, do zero ao primeiro lead</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="lead" style={{ marginTop: 24 }}>
                Eu não entrego "site bonito". Entrego estrutura de conversão. Cada elemento da página é pensado pra fazer o visitante tomar uma ação — agendar, comprar ou chamar no WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ marginTop: 32 }}>
                <a href="#cta" className="btn btn-primary">Quero esse padrão no meu site <span className="arrow">→</span></a>
              </div>
            </Reveal>
          </div>
          <div className="features">
            {FEATURES.map((f, i) =>
            <Reveal className="feature" key={i} delay={i * 60} dir="right">
                <span className="check">✓</span>
                <div>
                  <h3 className="feature-title">{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>);

}

// ─── PROJECT TYPES ──────────────────────────────────────────
const TYPES = [
{
  num: "01", badge: "Entrada",
  tag: "Landing Page",
  desc: "Página única focada em conversão. Ideal para captação de leads, lançamentos e campanhas pontuais.",
  features: [
  "Copy estratégica completa",
  "Design exclusivo",
  "SEO on-page incluso",
  "Integração com WhatsApp",
  "Entrega em 7 a 15 dias"],

  from: "a partir de", price: "R$ 1.200"
},
{
  num: "02", badge: "Mais escolhido", popular: true, featured: true,
  tag: "Site Institucional",
  desc: "Presença digital completa pra autoridade e geração de leads orgânicos via SEO.",
  features: [
  "Múltiplas páginas estratégicas",
  "Blog estruturado pra SEO",
  "Copy + Design + SEO técnico",
  "Painel editável (WordPress)",
  "Entrega em 20 a 30 dias"],

  from: "investimento", price: "sob consulta"
},
{
  num: "03", badge: "Avançado",
  tag: "E-commerce",
  desc: "Loja virtual estruturada pra vender no piloto automático, com integrações de pagamento e automação.",
  features: [
  "Catálogo de produtos completo",
  "Gateway de pagamento integrado",
  "Automações de carrinho/leads",
  "SEO de produto e categoria",
  "Cronograma personalizado"],

  from: "investimento", price: "sob consulta"
}];


function Types() {
  return (
    <section className="types" id="projetos">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 40, flexWrap: "wrap" }}>
          <div>
            <Reveal><span className="section-label">03 / Tipos de projeto</span></Reveal>
            <Reveal delay={80}><h2>Que tipo de site você precisa?</h2></Reveal>
          </div>
          <Reveal delay={140}>
            <p className="lead" style={{ maxWidth: 420 }}>
              Três escopos. Cada um pensado pra um momento diferente do seu negócio. Não sabe qual? O diagnóstico decide pra você.
            </p>
          </Reveal>
        </div>

        <div className="types-grid">
          {TYPES.map((t, i) =>
          <Reveal key={i} delay={i * 100}>
              <article className={`type-card${t.featured ? " featured" : ""}`}>
                <div className="type-top">
                  <span className="type-num">{t.num}</span>
                  <span className={`type-badge${t.popular ? " popular" : ""}`}>
                    {t.popular && <span className="type-badge-star">★</span>}
                    {t.badge}
                  </span>
                </div>
                <h3 className="type-name">{t.tag}</h3>
                <p className="type-desc">{t.desc}</p>
                <ul className="type-features">
                  {t.features.map((f, j) =>
                <li key={j}><span className="type-check">✓</span>{f}</li>
                )}
                </ul>
                <div className="type-price">
                  <span className="price-from">{t.from}</span>
                  <span className="price-value">{t.price}</span>
                </div>
                <a href="#cta" className="btn btn-primary type-cta">Quero esse projeto</a>
              </article>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}

// ─── PROOF / PORTFOLIO ──────────────────────────────────────
const PORTFOLIO = [
{
  namePrefix: "Dra. Eduarda", nameAccent: "Costa",
  url: "https://dreduardacosta.com.br/",
  img: "assets/portfolio/eduarda-costa.webp",
  tags: ["Landing Page", "Estética Regenerativa"],
  desc: "Landing page para enfermeira especialista em Estética Regenerativa, com copy sofisticada, tom acessível e captação via WhatsApp."
},
{
  namePrefix: "Bettina", nameAccent: "Rudolph",
  url: "https://zd.bettinarudolph.com.br/do-zero-ao-digital-fazedor-ia-oportunidade-especial-v2/",
  img: "assets/portfolio/bettina-rudolph.webp",
  tags: ["Landing Page", "Infoproduto"],
  desc: "Landing Page do carro-chefe da expert e infoprodutora, o Do Zero ao Digital. Estrutura pensada pra alta conversão em campanhas pagas."
},
{
  namePrefix: "Juliane", nameAccent: "Marrone",
  url: "https://nutrijumarrone.com.br/",
  img: "assets/portfolio/juliane-marrone.webp",
  tags: ["Landing Page", "Nutrição"],
  desc: "Landing Page de alta conversão para nutricionista especialista em envelhecimento, seguindo identidade visual da marca."
}];


function Proof() {
  return (
    <section className="proof" id="provas">
      <div className="container">
        <div className="proof-head">
          <div>
            <Reveal><span className="section-label">04 / Portfólio</span></Reveal>
            <Reveal delay={80}><h2>Sites reais, resultados reais.</h2></Reveal>
          </div>
          <Reveal delay={140}>
            <p className="lead" style={{ maxWidth: 460 }}>
              Conheça algumas pessoas que confiaram no meu trabalho. Cada projeto foi pensado do zero pra atender o posicionamento do cliente e converter o público certo.
            </p>
          </Reveal>
        </div>

        <div className="portfolio-grid">
          {PORTFOLIO.map((p, i) =>
          <Reveal key={i} delay={i * 100} className="portfolio-card">
              <div className="browser-frame">
                <div className="browser-bar">
                  <span className="browser-dot d-red" aria-hidden="true"></span>
                  <span className="browser-dot d-yellow" aria-hidden="true"></span>
                  <span className="browser-dot d-green" aria-hidden="true"></span>
                  <span className="browser-url">{p.url}</span>
                </div>
                <div className="browser-shot">
                  <img src={p.img} alt={`Captura de tela de ${p.url}`} loading="lazy" />
                </div>
              </div>
              <div className="portfolio-tags">
                {p.tags.map((t) => <span key={t} className="portfolio-tag">{t}</span>)}
              </div>
              <h3 className="portfolio-name">
                {p.namePrefix} <span className="portfolio-name-accent">{p.nameAccent}</span>
              </h3>
              <p className="portfolio-desc">{p.desc}</p>
              <a className="portfolio-link" href={`${p.url}`} target="_blank" rel="noreferrer">
                Ver projeto <span className="arrow">↗</span>
              </a>
            </Reveal>
          )}
        </div>

        <Reveal>
          <div className="logos-strip" aria-hidden="true">
            <div className="logos-track">
              <span>Bettina Rudolph</span>
              <span>Gerônimo Theml</span>
              <span>Saúde &amp; Estética</span>
              <span>Profissionais autônomos</span>
              <span>Grandes players</span>
              <span>Bettina Rudolph</span>
              <span>Gerônimo Theml</span>
              <span>Saúde &amp; Estética</span>
              <span>Profissionais autônomos</span>
              <span>Grandes players</span>
            </div>
          </div>
        </Reveal>

      </div>
    </section>);

}

// ─── ABOUT ──────────────────────────────────────────────────
const DIFFS = [
{ n: "01", t: "Foco em conversão, não em vaidade", d: "Métrica que importa é lead na sua agenda. Site bonito sem resultado é só portfólio caro." },
{ n: "02", t: "SEO incluso em todo projeto", d: "Sem custo extra, sem upsell. Estrutura técnica pra você aparecer no Google desde o dia 1." },
{ n: "03", t: "Transparência total", d: "Se você não precisa de um site novo, eu falo. Prefiro perder a venda a entregar algo que não vai te servir." },
{ n: "04", t: "Experiência com grandes players", d: "A mesma estrutura usada em projetos que faturam milhões, aplicada ao tamanho do seu negócio." }];


function About() {
  return (
    <section className="about" id="sobre">
      <div className="container">
        <div className="grid">
          <Reveal dir="left">
            <div className="about-photo">
              <img src="assets/giovanne-portrait.webp" alt="Giovanne Marrone, web designer" loading="lazy" />
              <span className="about-photo-tag">Giovanne Marrone</span>
            </div>
          </Reveal>
          <div>
            <Reveal><span className="section-label">05 / Sobre</span></Reveal>
            <Reveal delay={80}><h2>Por que trabalhar comigo</h2></Reveal>
            <Reveal delay={160}>
              <p className="lead" style={{ marginTop: 24 }}>
                Sou Giovanne, web designer focado em sites que geram resultado mensurável. Não vendo "presença digital" — vendo páginas que convertem visitante em cliente pagante.
              </p>
            </Reveal>
            <div className="about-bullets">
              {DIFFS.map((d, i) =>
              <Reveal key={i} delay={i * 80} className="about-bullet" dir="right">
                  <span className="num">{d.n}</span>
                  <div>
                    <h3 className="about-bullet-title">{d.t}</h3>
                    <p>{d.d}</p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}

// ─── FAQ ────────────────────────────────────────────────────
const FAQS = [
{
  q: "Quanto tempo leva pra entregar o site?",
  a: "Depende do escopo. Landing pages ficam prontas em 7 a 15 dias úteis. Sites institucionais entre 20 e 30 dias. E-commerces seguem cronograma personalizado. Todo prazo é alinhado antes do início, por escrito."
},
{
  q: "Vou ficar dependente de você pra mexer no site depois?",
  a: "Não. Entrego o acesso completo ao painel, com treinamento básico pra você editar textos, imagens e produtos sozinho. Suporte continuado é opcional, não obrigatório."
},
{
  q: "Sites baratos no Wix ou template pronto não resolvem?",
  a: "Resolvem se você quer só \"existir na internet\". Não resolvem se você quer que o site traga cliente. Template pronto não tem estrutura de conversão, copy estratégica nem SEO bem feito — e é por isso que a maioria dos profissionais paga barato uma vez e nunca vê retorno."
},
{
  q: "E se meu site atual estiver bom? Preciso refazer?",
  a: "Talvez não. Por isso o diagnóstico inicial é gratuito. Analiso seu site atual e te digo com honestidade se vale refazer, ajustar pontos específicos ou manter como está."
},
{
  q: "Como funciona o pagamento?",
  a: "50% na contratação e 50% na entrega. Sem taxas escondidas, sem mensalidades obrigatórias."
}];


function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="faq-grid">
          <div>
            <Reveal><span className="section-label">06 / FAQ</span></Reveal>
            <Reveal delay={80}><h2>Perguntas frequentes</h2></Reveal>
            <Reveal delay={160}>
              <p className="lead" style={{ marginTop: 24 }}>
                Dúvidas que aparecem antes da gente começar. Se a sua não está aqui, manda no WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <a href="#cta" className="btn btn-ghost" style={{ marginTop: 32 }}>
                Tirar dúvida no WhatsApp <span className="arrow">→</span>
              </a>
            </Reveal>
          </div>
          <div className="faq-list">
            {FAQS.map((item, i) =>
            <Reveal
              key={i}
              delay={i * 60}
              as="div"
              className={`faq-item${open === i ? " open" : ""}`}
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{ cursor: "default" }}>
              
                <div className="faq-q">
                  <span>{item.q}</span>
                  <span className="faq-toggle">+</span>
                </div>
                <div className="faq-a"><div>{item.a}</div></div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>);

}

// ─── CTA ────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="container">
        <Reveal>
          <div className="cta-card">
            <span className="section-label" style={{ justifyContent: "center" }}>07 / Próximo passo</span>
            <h2>Descubra o que está travando a conversão do seu site</h2>
            <p className="lead">
              Diagnóstico gratuito, direto e sem compromisso. Te mostro exatamente onde seu site está perdendo cliente — e se vale a pena investir em um novo ou ajustar o atual.
            </p>

            <div className="actions" style={{ marginTop: 36 }}>
              <a
                href="https://wa.me/5551996574342?text=Oi%20Giovanne%2C%20quero%20o%20diagn%C3%B3stico%20gratuito%20do%20meu%20site."
                target="_blank" rel="noopener"
                className="btn btn-primary btn-lg">
                
                <svg className="wa" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.42 1.32 4.92L2 22l5.31-1.39a9.86 9.86 0 0 0 4.73 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.05h-.01c-1.5 0-2.96-.4-4.24-1.16l-.3-.18-3.15.83.84-3.07-.2-.32a8.18 8.18 0 0 1-1.27-4.34c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.85 5.8 2.4a8.16 8.16 0 0 1 2.4 5.8c.01 4.53-3.67 8.24-8.07 8.24zm4.5-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12s-.64.8-.78.97c-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.28z" />
                </svg>
                Falar com Giovanne no WhatsApp <span className="arrow">→</span>
              </a>
            </div>
            <div className="micro">Resposta em até 2 horas em horário comercial.</div>
          </div>
        </Reveal>
      </div>
    </section>);

}

// ─── FOOTER ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="brand">
          <img src="assets/logo.webp" alt="Giovanne Marrone" className="brand-logo" />
          <span className="brand-text">
            <span className="name">Giovanne Marrone</span>
            <span className="role">web designer · feito pra converter</span>
          </span>
        </div>
        <div className="footer-links">
          <a href="#problema">Problema</a>
          <a href="#solucao">Solução</a>
          <a href="#projetos">Projetos</a>
          <a href="#faq">FAQ</a>
          <a href="#cta">Contato</a>
        </div>
        <div>© {new Date().getFullYear()} · feito pra converter</div>
      </div>
    </footer>);

}

// Make available to App.jsx
export {
  Nav, HeroV1, HeroV2, HeroV3,
  Problem, Solution, Types, Proof, About, FAQ, CTA, Footer
};