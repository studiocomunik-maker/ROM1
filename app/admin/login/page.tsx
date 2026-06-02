"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-coal px-6 text-paper">
      <form onSubmit={onSubmit} className="w-full max-w-[360px] space-y-5">
        <div className="mb-2">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-orange">ROM1 · Admin</p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-tight">Connexion</h1>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-paper/20 bg-transparent px-4 py-3 font-mono text-sm outline-none focus:border-orange"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/50">Mot de passe</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-paper/20 bg-transparent px-4 py-3 font-mono text-sm outline-none focus:border-orange"
          />
        </label>

        {error && <p className="font-mono text-xs text-orange">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange px-6 py-3 font-display text-sm uppercase tracking-[0.12em] text-coal transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
