import React from "react";
import { SITE_TYPES, STAGES, money, proposalUrl, shortDate, sum } from "./proposals.js";

const { useRef, useState } = React;

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// The logo's hexagon. A draft is hollow, so shape and label tell the stages apart without color.
function StageMark({ stage }) {
  return (
    <svg className="mark" data-stage={stage} viewBox="0 0 12 13" aria-hidden="true">
      <polygon points="6,.7 11.3,3.6 11.3,9.4 6,12.3 .7,9.4 .7,3.6" />
    </svg>);

}

function StageSelect({ proposal, onMove }) {
  return (
    <select className="stage" value={proposal.status}
      aria-label={`Etapa da proposta de ${proposal.client}`}
      onChange={(event) => onMove(proposal.id, event.target.value)}>
      {STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
    </select>);

}

function ProposalLinks({ id }) {
  const [label, setLabel] = useState("Copiar link");
  const url = proposalUrl(id);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLabel("Link copiado");
    } catch {
      setLabel("Não copiou: use Abrir");
    }
    setTimeout(() => setLabel("Copiar link"), 2200);
  };

  return (
    <>
      <a className="link" href={url} target="_blank" rel="noopener">Abrir</a>
      <button className="link" type="button" onClick={copy}>{label}</button>
    </>);

}

// ─── DASHBOARD ──────────────────────────────────────────────
function Lane({ stage, items, onMove }) {
  return (
    <section className="lane" aria-label={stage.label}>
      <header className="lane-head">
        <StageMark stage={stage.id} />
        <h3>{stage.label}</h3>
        <span className="lane-count">{items.length}</span>
      </header>
      <p className="lane-total">{money(sum(items))}</p>
      {items.length > 0 &&
        <ul className="deals">
          {items.map((item) =>
            <li className="deal" key={item.id}>
              <strong>{item.client}</strong>
              <span className="deal-type">{item.site_type}</span>
              <div className="deal-foot">
                <span>{money(item.budget)}</span>
                <StageSelect proposal={item} onMove={onMove} />
              </div>
            </li>)}
        </ul>}
    </section>);

}

function TypeBars({ proposals }) {
  const total = sum(proposals);
  if (!total) return <p className="empty">Os valores aparecem depois da primeira proposta.</p>;

  const rows = SITE_TYPES.map((type) => {
    const items = proposals.filter((item) => item.site_type === type);
    return { type, count: items.length, value: sum(items) };
  }).sort((a, b) => b.value - a.value);

  return (
    <table className="bars">
      <caption className="sr-only">Valor proposto por tipo de site</caption>
      <thead className="sr-only">
        <tr><th scope="col">Tipo de site</th><th scope="col">Valor</th><th scope="col">Volume</th></tr>
      </thead>
      <tbody>
        {rows.map((row) =>
          <tr key={row.type}>
            <th scope="row">{row.type}</th>
            <td className="bars-cell">
              <div className="bars-plot">
                {row.value > 0 && <span className="bar" style={{ "--share": row.value / rows[0].value }} />}
                <span>{money(row.value)}</span>
              </div>
            </td>
            <td className="bars-note">
              {count(row.count, "proposta", "propostas")}, {Math.round(row.value / total * 100)}%
            </td>
          </tr>)}
      </tbody>
    </table>);

}

export function Dashboard({ proposals, onMove }) {
  const inStage = (id) => proposals.filter((item) => item.status === id);
  const open = [...inStage("rascunho"), ...inStage("enviada")];
  const approved = inStage("aprovada");
  const decided = approved.length + inStage("recusada").length;

  return (
    <>
      <header className="page-head">
        <h1>Dashboard</h1>
        <a className="btn btn-small" href="#/propostas/nova">Nova proposta</a>
      </header>

      <div className="overview">
        <section aria-label="Resumo">
          <div className="hero-figure">
            <p>Em negociação</p>
            <strong>{money(sum(open))}</strong>
            <p className="note">{count(open.length, "proposta", "propostas")} em rascunho ou enviadas</p>
          </div>
          <dl className="kpis">
            <div className="kpi">
              <dt>Aprovado</dt>
              <dd>{money(sum(approved))}</dd>
              <dd className="note">{count(approved.length, "proposta", "propostas")}</dd>
            </div>
            <div className="kpi">
              <dt>Taxa de aprovação</dt>
              <dd>{decided ? `${Math.round(approved.length / decided * 100)}%` : "–"}</dd>
              <dd className="note">{decided ? `${approved.length} de ${decided} decididas` : "Nenhuma decidida"}</dd>
            </div>
            <div className="kpi">
              <dt>Total proposto</dt>
              <dd>{money(sum(proposals))}</dd>
              <dd className="note">{count(proposals.length, "proposta", "propostas")}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="types-title">
          <h2 id="types-title">Valor proposto por tipo de site</h2>
          <TypeBars proposals={proposals} />
        </section>
      </div>

      <section aria-labelledby="board-title">
        <h2 id="board-title">Funil</h2>
        <div className="board">
          {STAGES.map((stage) =>
            <Lane key={stage.id} stage={stage} items={inStage(stage.id)} onMove={onMove} />)}
        </div>
      </section>
    </>);

}

// ─── PROPOSTAS ──────────────────────────────────────────────
function Entry({ onAdd, autoFocus }) {
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const clientRef = useRef(null);

  // Digits fill in from the cents, as on a bank app: typing 3500 reads R$ 35,00.
  const typeBudget = (event) => {
    const cents = event.target.value.replace(/\D/g, "").slice(0, 12);
    setBudget(Number(cents) ? money(cents / 100) : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const client = fields.client.trim();
    setBusy(true);
    setSaved(null);

    const row = await onAdd({
      client,
      site_type: fields.site_type,
      budget: Number(budget.replace(/\D/g, "")) / 100,
    });
    setBusy(false);
    if (!row) return;

    form.reset();
    setBudget("");
    setSaved(row);
    clientRef.current.focus();
  };

  return (
    <>
      <form className="entry" onSubmit={submit}>
        <label className="field">
          <span>Cliente</span>
          <input name="client" required maxLength={200} pattern=".*\S.*" autoComplete="off"
            title="Informe o nome do cliente" autoFocus={autoFocus} ref={clientRef} />
        </label>
        <label className="field">
          <span>Tipo de site</span>
          <select name="site_type" required defaultValue="">
            <option value="" disabled>Selecione</option>
            {SITE_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Orçamento</span>
          <input name="budget" required inputMode="numeric" autoComplete="off" placeholder="R$ 0,00"
            value={budget} onChange={typeBudget} />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Salvando…" : "Salvar proposta"}
        </button>
      </form>
      <p className="saved" role="status">
        {saved &&
          <>
            <span>Proposta de {saved.client} salva. A página para o cliente está pronta.</span>
            <ProposalLinks id={saved.id} />
          </>}
      </p>
    </>);

}

function Row({ proposal, onMove, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <tr>
      <td className="list-client">{proposal.client}</td>
      <td className="list-type">{proposal.site_type}</td>
      <td className="list-budget num">{money(proposal.budget)}</td>
      <td className="list-stage">
        <span className="list-stage-inner">
          <StageMark stage={proposal.status} />
          <StageSelect proposal={proposal} onMove={onMove} />
        </span>
      </td>
      <td className="list-date">{shortDate(proposal.created_at)}</td>
      <td className="list-actions">
        {confirming ?
          <>
            <button className="link link-danger" type="button" onClick={() => onRemove(proposal.id)}>
              Confirmar exclusão
            </button>
            <button className="link" type="button" onClick={() => setConfirming(false)}>Cancelar</button>
          </> :
          <>
            <ProposalLinks id={proposal.id} />
            <button className="link" type="button" onClick={() => setConfirming(true)}
              aria-label={`Excluir proposta de ${proposal.client}`}>
              Excluir
            </button>
          </>}
      </td>
    </tr>);

}

export function Propostas({ proposals, focusEntry, onAdd, onMove, onRemove }) {
  return (
    <>
      <header className="page-head">
        <h1>Propostas</h1>
      </header>

      <Entry onAdd={onAdd} autoFocus={focusEntry} />

      {proposals.length === 0 ?
        <p className="empty">Nenhuma proposta ainda. Preencha o formulário acima para criar a primeira.</p> :
        <table className="list">
          <caption className="sr-only">Propostas salvas</caption>
          <thead>
            <tr>
              <th scope="col">Cliente</th>
              <th scope="col">Tipo de site</th>
              <th scope="col" className="num">Orçamento</th>
              <th scope="col">Etapa</th>
              <th scope="col">Criada em</th>
              <th scope="col"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) =>
              <Row key={proposal.id} proposal={proposal} onMove={onMove} onRemove={onRemove} />)}
          </tbody>
        </table>}
    </>);

}
