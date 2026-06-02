import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour les Client Components (s'exécute dans le navigateur).
// La clé "publishable" (sb_publishable_…) est publique par design : la sécurité
// réelle vient des policies RLS configurées côté base de données.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
