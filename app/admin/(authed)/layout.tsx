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
    <div className="admin min-h-screen bg-coal text-paper">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-paper/10 bg-coal/90 px-6 py-4 backdrop-blur md:px-10">
        <Link href="/admin" className="font-display text-base uppercase tracking-[0.2em]">
          ROM<span className="text-orange">1</span> · Admin
        </Link>
        <div className="flex items-center gap-5 font-mono text-sm uppercase tracking-[0.12em] text-paper/60">
          <span className="hidden sm:inline">{user.email}</span>
          <Link href="/admin" className="hidden transition-colors hover:text-paper sm:inline">
            Réalisations
          </Link>
          <Link href="/admin/sections" className="transition-colors hover:text-paper">
            Héros
          </Link>
          <Link href="/admin/settings" className="transition-colors hover:text-paper">
            Réglages
          </Link>
          <Link href="/" className="transition-colors hover:text-paper">
            Voir le site ↗
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="px-6 py-12 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
