import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Null until the env vars exist, so the page can say what is missing instead of crashing.
// Password login only: nothing should ever arrive through a URL token.
export const supabase = url && key
  ? createClient(url, key, { auth: { detectSessionInUrl: false } })
  : null;
