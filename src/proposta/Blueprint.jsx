import React from "react";

// A technical drawing of the site being proposed. Every part is numbered after its place in
// the plan's `includes`, so the item being read lights up the piece of the site it pays for.

const R = ({ x, y, w, h, r = 3, solid }) =>
  <rect x={x} y={y} width={w} height={h} rx={r} pathLength="1" className={solid ? "solid" : undefined} />;
const L = ({ x, y, w }) => <line x1={x} y1={y} x2={x + w} y2={y} pathLength="1" />;
const C = ({ x, y, r, solid }) =>
  <circle cx={x} cy={y} r={r} pathLength="1" className={solid ? "solid" : undefined} />;
const P = ({ d }) => <path d={d} pathLength="1" />;
const Hex = ({ points }) => <polygon points={points} pathLength="1" />;

function Part({ n, active, children }) {
  return <g className={`bp-part${n === active ? " on" : ""}`}>{children}</g>;
}

function Chrome() {
  return (
    <g>
      <R x={8} y={8} w={470} h={424} r={10} />
      <L x={8} y={40} w={470} />
      <C x={26} y={24} r={4} />
      <C x={40} y={24} r={4} />
      <C x={54} y={24} r={4} />
    </g>);

}

function AddressBar() {
  return (
    <>
      <R x={76} y={16} w={300} h={16} r={8} />
      <C x={90} y={24} r={3.5} />
      <L x={100} y={24} w={170} />
    </>);

}

function Sidebar() {
  return (
    <>
      <R x={8} y={41} w={78} h={391} r={0} solid />
      <C x={30} y={66} r={9} />
      <L x={20} y={94} w={54} />
      <L x={20} y={114} w={40} />
      <L x={20} y={134} w={48} />
      <L x={20} y={154} w={36} />
    </>);

}

function Training({ x, y }) {
  return (
    <>
      <R x={x} y={y} w={112} h={84} r={8} solid />
      <Hex points={`${x + 46},${y + 26} ${x + 46},${y + 58} ${x + 74},${y + 42}`} />
      <L x={x} y={y + 98} w={112} />
      <L x={x} y={y + 112} w={78} />
    </>);

}

function Bubble() {
  return (
    <>
      <C x={446} y={398} r={20} solid />
      <P d="M438 408l2-7a9 9 0 1 1 4 3z" />
    </>);

}

function Landing({ active }) {
  return (
    <>
      <Chrome />
      <R x={34} y={246} w={132} h={92} r={5} />
      <R x={176} y={246} w={132} h={92} r={5} />
      <R x={318} y={246} w={132} h={92} r={5} />
      <L x={34} y={362} w={380} />
      <L x={34} y={378} w={280} />
      <L x={34} y={394} w={330} />

      <Part n={0} active={active}>
        <L x={34} y={90} w={196} />
        <L x={34} y={108} w={150} />
        <L x={34} y={136} w={176} />
        <L x={34} y={150} w={160} />
        <L x={34} y={164} w={120} />
      </Part>
      <Part n={1} active={active}>
        <R x={262} y={66} w={190} h={150} r={6} solid />
        <Hex points="357,92 398,116 398,164 357,188 316,164 316,116" />
      </Part>
      <Part n={2} active={active}><AddressBar /></Part>
      <Part n={3} active={active}>
        <R x={34} y={184} w={124} h={32} r={16} solid />
        <Bubble />
      </Part>
      <Part n={4} active={active}>
        <R x={500} y={112} w={112} h={236} r={14} />
        <L x={538} y={124} w={36} />
        <L x={512} y={148} w={88} />
        <L x={512} y={160} w={70} />
        <R x={512} y={174} w={88} h={70} r={4} />
        <R x={512} y={256} w={62} h={18} r={9} solid />
        <L x={512} y={292} w={88} />
        <L x={512} y={304} w={70} />
      </Part>
      <Part n={5} active={active}>
        <P d="M396 30a13 13 0 0 1 26 0" />
        <P d="M409 30l7-9" />
        <L x={8} y={42} w={310} />
      </Part>
    </>);

}

function Institutional({ active }) {
  return (
    <>
      <Chrome />
      <AddressBar />

      <Part n={0} active={active}>
        <R x={104} y={52} w={58} h={16} r={8} />
        <R x={170} y={52} w={58} h={16} r={8} />
        <R x={236} y={52} w={58} h={16} r={8} />
        <R x={302} y={52} w={58} h={16} r={8} />
        <R x={530} y={40} w={52} h={22} r={4} solid />
        <P d="M556 62v22H518v14M556 84v14M556 84h38v14" />
        <R x={502} y={98} w={32} h={20} r={3} />
        <R x={540} y={98} w={32} h={20} r={3} />
        <R x={578} y={98} w={32} h={20} r={3} />
      </Part>
      <Part n={1} active={active}>
        {[104, 224, 344].map((x) =>
          <g key={x}>
            <R x={x} y={212} w={112} h={62} r={4} solid />
            <L x={x} y={288} w={100} />
            <L x={x} y={300} w={76} />
          </g>)}
      </Part>
      <Part n={2} active={active}>
        <L x={104} y={98} w={170} />
        <L x={104} y={116} w={130} />
        <L x={104} y={142} w={150} />
        <L x={104} y={156} w={120} />
        <R x={300} y={84} w={156} h={104} r={6} solid />
      </Part>
      <Part n={3} active={active}><Sidebar /></Part>
      <Part n={4} active={active}>
        <R x={104} y={326} w={176} h={24} r={4} />
        <R x={104} y={358} w={176} h={24} r={4} />
        <R x={104} y={392} w={96} h={24} r={12} solid />
        <Bubble />
      </Part>
      <Part n={5} active={active}><Training x={500} y={186} /></Part>
    </>);

}

function Store({ active }) {
  return (
    <>
      <Chrome />

      <Part n={0} active={active}>
        {[104, 222, 340].flatMap((x) => [78, 256].map((y) =>
          <g key={`${x}${y}`}>
            <R x={x} y={y} w={108} h={112} r={5} solid />
            <L x={x} y={y + 126} w={92} />
            <L x={x} y={y + 140} w={54} />
          </g>))}
      </Part>
      <Part n={1} active={active}>
        <R x={500} y={40} w={112} h={72} r={8} solid />
        <L x={500} y={62} w={112} />
        <L x={512} y={90} w={44} />
        <P d="M574 88l8 8 14-16" />
      </Part>
      <Part n={2} active={active}>
        <P d="M512 138h12l8 34h44l8-24h-56" />
        <C x={538} y={184} r={6} />
        <C x={570} y={184} r={6} />
        <P d="M556 198v18m-6-6 6 6 6-6" />
        <R x={524} y={224} w={64} h={42} r={4} />
        <P d="M524 228l32 20 32-20" />
      </Part>
      <Part n={3} active={active}>
        <AddressBar />
        <L x={104} y={56} w={60} />
        <L x={174} y={56} w={60} />
        <L x={244} y={56} w={60} />
      </Part>
      <Part n={4} active={active}><Sidebar /></Part>
      <Part n={5} active={active}><Training x={500} y={292} /></Part>
    </>);

}

const DRAWINGS = { "Landing Page": Landing, "Site Institucional": Institutional, "E-commerce": Store };

export function Blueprint({ type, active }) {
  const Drawing = DRAWINGS[type];
  if (!Drawing) return null;
  return (
    <svg className="bp" viewBox="0 0 620 440" aria-hidden="true">
      <Drawing active={active} />
      <rect className="bp-scan" x="8" y="41" width="470" height="2" />
    </svg>);

}
