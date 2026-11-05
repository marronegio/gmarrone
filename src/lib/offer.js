// The commercial offer, shared by the public site and the proposal page so they never disagree.

export const whatsapp = (message) =>
  `https://wa.me/5551996574342?text=${encodeURIComponent(message)}`;

export const PAYMENT_TERMS = "50% na contratação e 50% na entrega. Não tem taxa escondida nem mensalidade obrigatória.";

export const STATS = [
{ to: 30, prefix: "+", label: "profissionais já confiaram no meu trabalho" },
{ to: 40, prefix: "+", label: "páginas criadas para Bettina Rudolph" },
{ to: 15, prefix: "+", label: "páginas criadas para Gerônimo Theml" },
{ to: 20, prefix: "+", suffix: "%", label: "de connect rate em grandes players" }];


export const DIFFS = [
{ t: "*Conversão* em primeiro lugar", d: "Eu olho pra quantas pessoas o site leva até a sua agenda. O visual entra pra ajudar nisso." },
{ t: "SEO *incluso* em todo projeto", d: "Já vem no valor. Eu deixo a parte técnica pronta pra você aparecer no Google desde a publicação." },
{ t: "Se não precisa, *eu falo*", d: "Se o seu site atual dá conta, eu digo. Prefiro perder a venda a te entregar algo que não vai servir." },
{ t: "Experiência com *grandes players*", d: "Já fiz páginas pra Bettina Rudolph, Gerônimo Theml e IGT Coaching. Levo o que funciona nesses projetos pro tamanho do seu negócio." }];


export const PROJECTS = [
{
  first: "Dra. Eduarda", last: "Costa",
  url: "https://dreduardacosta.com.br/",
  host: "dreduardacosta.com.br",
  img: "assets/portfolio/eduarda-long.webp",
  imgMobile: "assets/portfolio/eduarda-long-m.webp",
  size: [1600, 5862],
  sizeMobile: [780, 7492],
  tags: "Landing Page, Estética Regenerativa",
  desc: "Landing page para enfermeira especialista em Estética Regenerativa, com copy sofisticada, tom acessível e captação via WhatsApp."
},
{
  first: "Bettina", last: "Rudolph",
  url: "https://zd.bettinarudolph.com.br/do-zero-ao-digital-fazedor-ia-oportunidade-especial-v2/",
  host: "bettinarudolph.com.br",
  img: "assets/portfolio/bettina-long.webp",
  imgMobile: "assets/portfolio/bettina-long-m.webp",
  size: [1600, 6046],
  sizeMobile: [780, 7656],
  tags: "Landing Page, Infoproduto",
  desc: "Landing Page do carro-chefe da expert e infoprodutora, o Do Zero ao Digital. Estrutura pensada pra alta conversão em campanhas pagas."
},
{
  first: "Juliane", last: "Marrone",
  url: "https://nutrijumarrone.com.br/",
  host: "nutrijumarrone.com.br",
  img: "assets/portfolio/juliane-long.webp",
  imgMobile: "assets/portfolio/juliane-long-m.webp",
  size: [1600, 5598],
  sizeMobile: [780, 6602],
  tags: "Landing Page, Nutrição",
  desc: "Landing Page de alta conversão para nutricionista especialista em envelhecimento, seguindo identidade visual da marca."
},
// No public address yet, so these cards are not links. Fill in `url` once each page is online.
{
  first: "IGT Coaching", last: "MBA Turma Fundadora",
  url: null,
  host: "igtcoaching.com.br",
  img: "assets/portfolio/igt-mba-long.webp",
  imgMobile: "assets/portfolio/igt-mba-long-m.webp",
  size: [1600, 5674],
  sizeMobile: [780, 6798],
  tags: "Landing Page, Liderança",
  desc: "Captação da Turma Fundadora do MBA em Neurociência e Liderança, com entrada no Grupo VIP e revelação da condição ao vivo."
},
{
  first: "IGT Coaching", last: "A Black do Coaching",
  url: null,
  host: "igtcoaching.com.br",
  img: "assets/portfolio/igt-black-long.webp",
  imgMobile: "assets/portfolio/igt-black-long-m.webp",
  size: [1600, 5508],
  sizeMobile: [780, 8484],
  tags: "Landing Page, Formação em Coaching",
  desc: "Inscrição para a live de Black Friday da Formação em Coaching, com o preço guardado para a revelação ao vivo."
},
{
  first: "Geronimo Theml", last: "Fora da Média",
  url: null,
  host: "geronimo.com.br",
  img: "assets/portfolio/geronimo-black-long.webp",
  imgMobile: "assets/portfolio/geronimo-black-long-m.webp",
  size: [1600, 5907],
  sizeMobile: [780, 7248],
  tags: "Landing Page, Black Friday",
  desc: "Inscrição para a live de Black Friday que abre o acesso vitalício a todos os cursos do Geronimo."
},
{
  first: "Geronimo Theml", last: "Protocolo 6%",
  url: null,
  host: "geronimo.com.br",
  img: "assets/portfolio/geronimo-protocolo-long.webp",
  imgMobile: "assets/portfolio/geronimo-protocolo-long-m.webp",
  size: [1600, 5442],
  sizeMobile: [780, 6656],
  tags: "Landing Page, Imersão ao Vivo",
  desc: "Página de vendas da imersão de 1 dia sobre hábitos, com oferta por lotes e checkout direto."
}];


export const FAQS = [
{
  q: "Quanto tempo leva pra entregar o site?",
  a: "Depende do escopo. Landing pages ficam prontas em 7 a 15 dias úteis. Sites institucionais entre 20 e 30 dias. E-commerces seguem cronograma personalizado. Todo prazo é alinhado antes do início, por escrito."
},
{
  q: "Vou ficar dependente de você pra mexer no site depois?",
  a: "Não. Entrego o acesso completo ao painel, com treinamento básico pra você editar textos, imagens e produtos sozinho. Se quiser suporte depois, a gente combina à parte."
},
{
  q: "Sites baratos no Wix ou template pronto não resolvem?",
  a: "Resolvem se você só quer ter um endereço na internet. Se a ideia é o site trazer cliente, quase nunca: o template vem com texto genérico e ninguém pensou no seu público quando montou a página. Sai barato, mas não volta nada."
},
{
  q: "E se meu site atual estiver bom? Preciso refazer?",
  a: "Talvez não. Antes de falar em projeto novo, olho o que você já tem e te digo com honestidade se vale refazer, ajustar pontos específicos ou manter como está."
},
{
  q: "Como funciona o pagamento?",
  a: PAYMENT_TERMS
}];


export const CLIENTS = [
{ name: "Dra. Eduarda Costa", img: "assets/clients/eduarda.webp" },
{ name: "Nutri Juliane Marrone", img: "assets/clients/juliane.webp" },
{ name: "Grupo Líbertas", img: "assets/clients/libertas.webp" },
{ name: "IGT International Coaching", img: "assets/clients/igt.webp" },
{ name: "Bettina Rudolph", img: "assets/clients/bettina.webp" },
{ name: "Gerônimo Theml", img: "assets/clients/geronimo.webp" },
{ name: "Dra. Ana Eduarda Tanios", img: "assets/clients/ana-eduarda.webp" }];


export const PLANS = [
{
  name: "Landing Page", badge: "Entrada",
  titles: { scope: "Sua *página,* por dentro", path: "Do sim à *página no ar*" },
  desc: "Uma página com um único objetivo, como captar contatos ou vender um lançamento.",
  summary: ["Entrega em 7 a 15 dias", "Uma página, um objetivo de conversão", "Copy, design e SEO on-page"],
  cta: "Começar meu projeto",
  note: "Ponto de partida pra captar leads",
  includes: [
  "Copy estratégica completa",
  "Design exclusivo",
  "SEO on-page incluso",
  "Integração com WhatsApp",
  "Responsivo, do iPhone SE ao desktop 4K",
  "Carregamento rápido"],

  // One line per item of `includes`, in the same order; the proposal page shows them side by side
  details: [
  "Escrevo do zero, a partir do que você vende e de quem compra de você.",
  "Desenhado em cima da identidade visual do seu negócio.",
  "Pra você aparecer no Google sem depender só de anúncio. Já está no valor.",
  "Quem gostou da página fala com você no WhatsApp em um toque.",
  "Desenho primeiro pro celular, que é onde a maioria das pessoas vai abrir a página.",
  "Página lenta perde visita e posição no Google. Eu otimizo imagens e código pra ela abrir rápido."],

  handover: "Você paga os outros 50% e sua página vai pro ar."
},
{
  name: "Site Institucional", badge: "Mais escolhido", featured: true,
  titles: { scope: "Seu *site,* por dentro", path: "Do sim ao *site no ar*" },
  desc: "Várias páginas e um blog, pra quem procura o seu serviço no Google chegar até você e confiar no que vê.",
  summary: ["Entrega em 20 a 30 dias", "Múltiplas páginas, com blog", "Painel editável em WordPress"],
  cta: "Quero meu site",
  note: "O projeto mais escolhido pelos meus clientes",
  includes: [
  "Múltiplas páginas estratégicas",
  "Blog estruturado pra SEO",
  "Copy + Design + SEO técnico",
  "Painel editável (WordPress)",
  "Integrações com WhatsApp e formulários",
  "Treinamento básico pra editar sozinho"],

  details: [
  "Uma página pra cada serviço ou assunto importante, e cada uma com um objetivo claro.",
  "Cada artigo é mais uma chance de alguém te achar no Google.",
  "Escrevo o texto, desenho as páginas na sua identidade e cuido da parte técnica pro Google.",
  "Acesso completo pra você editar textos e imagens sozinho.",
  "Formulário e WhatsApp ligados às ferramentas que você já usa.",
  "Você aprende a mexer no site sozinho. Se quiser suporte depois, a gente combina à parte."],

  handover: "Você paga os outros 50% e recebe o site no ar, com acesso ao painel e treinamento básico."
},
{
  name: "E-commerce", badge: "Avançado",
  titles: { scope: "Sua *loja,* por dentro", path: "Do sim à *loja no ar*" },
  desc: "Loja virtual com catálogo, pagamento sem sair da página e lembrete pra quem abandona o carrinho.",
  summary: ["Cronograma personalizado", "Catálogo e pagamento integrados", "Automações de carrinho e leads"],
  cta: "Solicitar projeto",
  note: "Prazo alinhado por escrito antes de começar",
  includes: [
  "Catálogo de produtos completo",
  "Gateway de pagamento integrado",
  "Automações de carrinho/leads",
  "SEO de produto e categoria",
  "Acesso ao painel pra gerenciar produtos",
  "Treinamento básico pra editar sozinho"],

  details: [
  "Seus produtos organizados em categorias, do jeito que o seu cliente procura.",
  "O cliente paga sem sair da loja.",
  "Quem abandona o carrinho recebe um lembrete. Quem deixa o contato fica salvo pra você.",
  "Pra cada produto aparecer no Google sem depender só de anúncio.",
  "Você edita textos, imagens e produtos sozinho.",
  "Você aprende a mexer na loja sozinho. Se quiser suporte depois, a gente combina à parte."],

  handover: "Você paga os outros 50% e recebe a loja no ar, com acesso ao painel e treinamento básico."
}];
