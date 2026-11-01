import React from "react";
import { supabase } from "./supabase.js";

const { useCallback, useEffect, useState } = React;

export const SITE_TYPES = ["Landing Page", "Site Institucional", "E-commerce"];

export const STAGES = [
  { id: "rascunho", label: "Rascunho" },
  { id: "enviada", label: "Enviada" },
  { id: "aprovada", label: "Aprovada" },
  { id: "recusada", label: "Recusada" },
];

const COLUMNS = "id, client, site_type, budget, status, created_at";
const LOAD_FAILED = "Não foi possível carregar as propostas. Verifique sua conexão.";
const TABLE_MISSING = "A tabela de propostas não existe neste banco. Rode supabase db push e tente de novo.";
const SAVE_FAILED = "A alteração não foi salva. Verifique sua conexão e tente de novo.";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const day = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export const money = (value) => brl.format(value);
export const shortDate = (value) => day.format(new Date(value));
export const sum = (items) => items.reduce((total, item) => total + Number(item.budget), 0);

// Relative, so the link works wherever the panel is served from. The id stays after the #,
// which keeps it out of server logs.
export const proposalUrl = (id) => new URL(`../proposta/#${id}`, window.location.href).href;

export function useProposals() {
  const [proposals, setProposals] = useState(null); // null until the first load lands
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: failure } = await supabase.from("proposals")
      .select(COLUMNS).order("created_at", { ascending: false });
    setError(failure ? (failure.code === "PGRST205" ? TABLE_MISSING : LOAD_FAILED) : "");
    if (!failure) setProposals(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (fields) => {
    const { data, error: failure } = await supabase.from("proposals")
      .insert(fields).select(COLUMNS).single();
    setError(failure ? SAVE_FAILED : "");
    if (failure) return null;
    setProposals((list) => [data, ...list]);
    return data;
  };

  // Optimistic, so a card changes lane at once; a failure puts the stored stage back.
  const move = async (id, status) => {
    setProposals((list) => list.map((item) => (item.id === id ? { ...item, status } : item)));
    const { error: failure } = await supabase.from("proposals").update({ status }).eq("id", id);
    if (!failure) return setError("");
    await load();
    setError(SAVE_FAILED);
  };

  const remove = async (id) => {
    const { error: failure } = await supabase.from("proposals").delete().eq("id", id);
    setError(failure ? SAVE_FAILED : "");
    if (!failure) setProposals((list) => list.filter((item) => item.id !== id));
  };

  return { proposals, error, load, add, move, remove };
}
