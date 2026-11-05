import type { User } from "@supabase/supabase-js";

/** Seul un compte portant `app_metadata.role = "admin"` ouvre l'admin et les
 *  routes API (Pennylane, compta…). Ce champ ne se pose qu'avec la clé secrète
 *  ou en SQL : un compte créé par l'API publique de Supabase n'a aucun droit.
 *  Même règle côté base : `public.is_admin()` dans les policies RLS. */
export function isAdminUser(user: User | null | undefined): user is User {
  return user?.app_metadata?.role === "admin";
}
