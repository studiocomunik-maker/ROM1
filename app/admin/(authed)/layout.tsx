import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import LogoutButton from "../LogoutButton";

// Garde serveur (défense en profondeur en plus du proxy) + chrome admin.
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-coal text-paper">
      <header className="flex items-center justify-between border-b border-paper/10 px-6 py-4 md:px-10">
        <Link href="/admin" className="font-display text-sm uppercase tracking-[0.2em]">
          ROM1 · Admin
        </Link>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">
          <span className="hidden sm:inline">{user.email}</span>
          <Link href="/" className="transition-colors hover:text-paper">
            Voir le site ↗
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}
