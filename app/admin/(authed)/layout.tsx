import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import AdminSidebar from "./AdminSidebar";

// Garde serveur (défense en profondeur en plus du proxy) + chrome admin.
export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin flex min-h-screen flex-col bg-coal text-paper md:flex-row">
      <AdminSidebar email={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-6 py-10 md:px-10 md:py-12">{children}</main>
    </div>
  );
}
