import React from "react";
import { supabase } from "./supabase.js";
import { useProposals } from "./proposals.js";
import { Dashboard, Propostas } from "./pages.jsx";

const { useEffect, useRef, useState } = React;

const NOT_CONFIGURED = "Login indisponível: faltam as variáveis do Supabase neste build.";

const NAV = [
  { href: "#/", label: "Dashboard", icon: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z" },
  { href: "#/propostas", label: "Propostas", icon: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" },
];

function loginError(error) {
  if (error.code === "invalid_credentials") return "E-mail ou senha incorretos.";
  if (error.code === "email_not_confirmed") return "Conta sem confirmação: confirme o usuário no Supabase.";
  if (error.status === 429) return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  return "Não foi possível entrar agora. Verifique sua conexão e tente de novo.";
}

// The site's iris: six half-planes around a hexagonal hole. Closed until the session
// is known, opened to a hexagon around the form, opened all the way once signed in.
function Iris({ stage, instant, flinches, children }) {
  return (
    <div className="iris" data-stage={stage} data-instant={instant || undefined}>
      <div className={`iris-blades${flinches ? " flinch" : ""}`} key={flinches} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <span className="blade" key={i} style={{ "--i": i }} />)}
      </div>
      {children}
    </div>);

}

function Login({ onFail }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(supabase ? "" : NOT_CONFIGURED);
  const passwordRef = useRef(null);

  const submit = async (event) => {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");

    const { error: failure } = await supabase.auth.signInWithPassword({ email, password });
    if (!failure) return; // onAuthStateChange takes it from here

    setBusy(false);
    setError(loginError(failure));
    passwordRef.current.value = "";
    passwordRef.current.focus();
    onFail();
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={submit}>
        <img src="../assets/logo.webp" alt="" width="44" height="44" />
        <h1 className="sr-only">Acesso</h1>

        <label className="field">
          <span>E-mail</span>
          <input type="email" name="email" autoComplete="username" autoCapitalize="none"
            spellCheck="false" required autoFocus />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" name="password" autoComplete="current-password"
            required ref={passwordRef} />
        </label>

        {error && <p className="login-error" role="alert">{error}</p>}

        <button className="btn" type="submit" disabled={busy || !supabase}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>);

}

// Hash routes: the host is plain FTP, so a real path would 404 on reload.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const sync = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return hash;
}

function Shell({ email }) {
  const hash = useHash();
  const { proposals, error, load, add, move, remove } = useProposals();
  const onPropostas = hash.startsWith("#/propostas");

  // A failed global sign-out (offline, say) must still end the session on this device.
  const signOut = async () => {
    const { error: failure } = await supabase.auth.signOut();
    if (failure) await supabase.auth.signOut({ scope: "local" });
  };

  return (
    <div className="shell">
      <aside className="side">
        <a className="side-brand" href="#/" aria-label="Dashboard">
          <img src="../assets/logo.webp" alt="" width="30" height="30" />
          <span>Painel</span>
        </a>
        <nav className="side-nav" aria-label="Principal">
          {NAV.map((item) =>
            <a key={item.href} href={item.href}
              aria-current={(item.href === "#/propostas") === onPropostas ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </a>)}
        </nav>
        <div className="side-foot">
          <span className="side-account">{email}</span>
          <button className="btn btn-quiet" type="button" onClick={signOut}>Sair</button>
        </div>
      </aside>

      <main className="page">
        {error &&
          <div className="notice" role="alert">
            <p>{error}</p>
            {!proposals && <button className="link" type="button" onClick={load}>Tentar de novo</button>}
          </div>}
        {!proposals && !error && <p className="empty" role="status">Carregando…</p>}
        {proposals && (onPropostas ?
          <Propostas proposals={proposals} focusEntry={hash.endsWith("/nova")}
            onAdd={add} onMove={move} onRemove={remove} /> :
          <Dashboard proposals={proposals} onMove={move} />)}
      </main>
    </div>);

}

export default function App() {
  const [session, setSession] = useState(supabase ? undefined : null);
  const [instant, setInstant] = useState(false);
  const [flinches, setFlinches] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      // Returning with a live session skips the opening: this is a tool, not a reveal.
      setInstant(event === "INITIAL_SESSION" && Boolean(next));
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const stage = session === undefined ? "closed" : session ? "open" : "aperture";

  return (
    <>
      {session && <Shell email={session.user.email} />}
      <Iris stage={stage} instant={instant} flinches={flinches}>
        {session === null && <Login onFail={() => setFlinches((n) => n + 1)} />}
      </Iris>
    </>);

}
