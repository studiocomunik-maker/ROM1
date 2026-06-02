"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="uppercase tracking-[0.12em] text-orange transition-opacity hover:opacity-70"
    >
      Déconnexion
    </button>
  );
}
