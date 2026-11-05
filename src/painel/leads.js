import React from "react";
import { supabase } from "./supabase.js";

const { useCallback, useEffect, useState } = React;

const COLUMNS = "id, name, email, whatsapp, source, created_at";
const LOAD_FAILED = "Não foi possível carregar os leads. Verifique sua conexão.";
const TABLE_MISSING = "A tabela de leads não existe neste banco. Rode supabase db push e tente de novo.";
const SAVE_FAILED = "A alteração não foi salva. Verifique sua conexão e tente de novo.";

const moment = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
export const receivedAt = (value) => moment.format(new Date(value));

// Stored as digits, with or without the 55. Shown as people write it: (51) 99657-4342.
const national = (digits) => (digits.length > 11 ? digits.slice(2) : digits);
export function phone(digits) {
  const local = national(digits);
  const split = local.length - 4;
  return `(${local.slice(0, 2)}) ${local.slice(2, split)}-${local.slice(split)}`;
}
export const whatsappUrl = (digits) => `https://wa.me/55${national(digits)}`;

export function useLeads() {
  const [leads, setLeads] = useState(null); // null until the first load lands
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: failure } = await supabase.from("leads")
      .select(COLUMNS).order("created_at", { ascending: false });
    setError(failure ? (failure.code === "PGRST205" ? TABLE_MISSING : LOAD_FAILED) : "");
    if (!failure) setLeads(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    const { error: failure } = await supabase.from("leads").delete().eq("id", id);
    setError(failure ? SAVE_FAILED : "");
    if (!failure) setLeads((list) => list.filter((item) => item.id !== id));
  };

  return { leads, error, load, remove };
}
