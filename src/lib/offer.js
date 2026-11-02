// The commercial offer, shared by the public site and the proposal page so they never disagree.

export const whatsapp = (message) =>
  `https://wa.me/5551996574342?text=${encodeURIComponent(message)}`;

export const PAYMENT_TERMS = "50% na contratação e 50% na entrega. Sem taxas escondidas, sem mensalidades obrigatórias.";

export const STATS = [
{ to: 30, prefix: "+", label: "profissionais já confiaram no meu trabalho" },
{ to: 40, prefix: "+", label: "páginas criadas para Bettina Rudolph" },
{ to: 15, prefix: "+", label: "páginas criadas para Gerônimo Theml" },
{ to: 20, prefix: "+", suffix: "%", label: "de connect rate em grandes players" }];


export const DIFFS = [
{ t: "*Foco em conversão,* não em vaidade", d: "Métrica que importa é lead na sua agenda. Site bonito sem resultado é só portfólio caro." },
{ t: "SEO *incluso* em todo projeto", d: "Sem custo extra, sem upsell. Estrutura técnica pra você aparecer no Google desde o dia 1." },
{ t: "*Transparência* total", d: "Se você não precisa de um site novo, eu falo. Prefiro perder a venda a entregar algo que não vai te servir." },
{ t: "Experiência com *grandes players*", d: "A mesma estrutura usada em projetos que faturam milhões, aplicada ao tamanho do seu negócio." }];


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
  a: "Não. Entrego o acesso completo ao painel, com treinamento básico pra você editar textos, imagens e produtos sozinho. Suporte continuado é opcional, não obrigatório."
},
{
  q: "Sites baratos no Wix ou template pronto não resolvem?",
  a: "Resolvem se você quer só \"existir na internet\". Não resolvem se você quer que o site traga cliente. Template pronto não tem estrutura de conversão, copy estratégica nem SEO bem feito — e é por isso que a maioria dos profissionais paga barato uma vez e nunca vê retorno."
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
  desc: "Página única focada em conversão. Ideal para captação de leads, lançamentos e campanhas pontuais.",
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
  "Escrita do zero com base no seu posicionamento, público e oferta. Não é template traduzido.",
  "Alinhado à identidade visual do seu negócio, não a uma estética genérica de Wix.",
  "Pra você aparecer no Google sem depender de tráfego pago. Sem custo extra, sem upsell.",
  "Conectada no projeto, pra visita interessada virar conversa com você.",
  "Mobile-first. Funciona perfeitamente em qualquer dispositivo.",
  "Pra ranquear melhor no Google e segurar o visitante na página."],

  handover: "Você paga os outros 50% e sua página vai pro ar."
},
{
  name: "Site Institucional", badge: "Mais escolhido", featured: true,
  titles: { scope: "Seu *site,* por dentro", path: "Do sim ao *site no ar*" },
  desc: "Presença digital completa pra autoridade e geração de leads orgânicos via SEO.",
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
  "Presença digital completa, pensada pra construir autoridade e gerar leads orgânicos.",
  "Estrutura técnica pra você aparecer no Google desde o dia 1.",
  "Texto escrito do zero, design alinhado à sua identidade e estrutura pronta pro Google.",
  "Acesso completo pra você editar textos e imagens sozinho.",
  "As ferramentas que você já usa, conectadas no projeto.",
  "Você aprende a mexer no site. Suporte continuado é opcional, não obrigatório."],

  handover: "Você paga os outros 50% e recebe o site no ar, com acesso ao painel e treinamento básico."
},
{
  name: "E-commerce", badge: "Avançado",
  titles: { scope: "Sua *loja,* por dentro", path: "Do sim à *loja no ar*" },
  desc: "Loja virtual estruturada pra vender no piloto automático, com integrações de pagamento e automação.",
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
  "Loja virtual estruturada pra vender no piloto automático.",
  "Pagamento integrado à loja, sem desvio pro cliente no meio da compra.",
  "Automações que trabalham no carrinho e nos leads enquanto você atende.",
  "Pra cada produto aparecer no Google sem depender de tráfego pago.",
  "Você edita textos, imagens e produtos sozinho.",
  "Você aprende a mexer na loja. Suporte continuado é opcional, não obrigatório."],

  handover: "Você paga os outros 50% e recebe a loja no ar, com acesso ao painel e treinamento básico."
}];
