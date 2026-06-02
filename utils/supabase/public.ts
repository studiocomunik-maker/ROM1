import { createClient } from "@supabase/supabase-js";

// Client Supabase ANONYME et SANS cookies, pour les lectures publiques du site
// (réalisations publiées). Pas de session → les pages restent prerenderables (SSG/ISR).
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);
